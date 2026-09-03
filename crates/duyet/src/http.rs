use std::fs;
use std::path::PathBuf;
use std::thread;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use reqwest::blocking::{Client, Response};
use reqwest::header::{CACHE_CONTROL, ETAG, HeaderMap, IF_NONE_MATCH};
use reqwest::{Method, StatusCode};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use url::Url;

use crate::cli::Globals;
use crate::config::Settings;
use crate::error::CliError;
use crate::output::Redactor;
use crate::paths::Paths;
use crate::{TARGET, VERSION};

const ATTEMPTS: u32 = 3;
const BACKOFF_BASE: Duration = Duration::from_millis(200);
const PROBE_TIMEOUT: Duration = Duration::from_secs(5);

pub struct Http {
    client: Client,
    cache_dir: PathBuf,
    offline: bool,
    verbosity: u8,
    timeout: Duration,
    redactor: Redactor,
}

#[derive(Debug, PartialEq, Eq)]
pub struct Fetched {
    pub body: String,
    pub from_cache: bool,
    pub etag: Option<String>,
    pub request_id: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ProbeStatus {
    Reachable { status: u16 },
    Unreachable { message: String },
    Skipped { reason: &'static str },
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct Probe {
    pub url: String,
    pub status: ProbeStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub latency_ms: Option<u64>,
}

/// On-disk cache record, one JSON file per URL under `<cache_dir>/http/`.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct CacheEntry {
    pub url: String,
    pub body: String,
    pub etag: Option<String>,
    pub fetched_at: u64,
    pub max_age: u64,
    pub request_id: Option<String>,
}

impl CacheEntry {
    fn fresh(&self, now: u64) -> bool {
        now.saturating_sub(self.fetched_at) < self.max_age
    }
}

impl Http {
    pub fn new(paths: &Paths, globals: &Globals, settings: &Settings) -> Result<Http, CliError> {
        // reqwest's `rustls-no-provider` leaves the crypto provider to us; ring keeps the
        // musl build free of a C toolchain dependency. A second install is a harmless Err.
        rustls::crypto::ring::default_provider()
            .install_default()
            .ok();
        let timeout = Duration::from_secs(globals.timeout.max(1));
        let mut builder = Client::builder()
            .user_agent(format!(
                "duyet/{VERSION} ({}; {TARGET})",
                settings.channel()
            ))
            .timeout(timeout)
            .connect_timeout(timeout.min(Duration::from_secs(10)));
        if let Some(bundle) = std::env::var_os("DUYET_CA_BUNDLE") {
            let path = PathBuf::from(bundle);
            let pem = fs::read(&path).map_err(|source| CliError::Io {
                path: path.clone(),
                source,
            })?;
            let certs = reqwest::Certificate::from_pem_bundle(&pem).map_err(|err| {
                CliError::Internal(format!("DUYET_CA_BUNDLE {}: {err}", path.display()))
            })?;
            for cert in certs {
                builder = builder.add_root_certificate(cert);
            }
        }
        let client = builder
            .build()
            .map_err(|err| CliError::Internal(format!("http client: {err}")))?;
        Ok(Http {
            client,
            cache_dir: paths.cache_dir.join("http"),
            offline: globals.offline,
            verbosity: globals.verbose,
            timeout,
            redactor: Redactor::from_env(),
        })
    }

    pub fn cache_path(&self, url: &Url) -> PathBuf {
        let digest = Sha256::digest(url.as_str().as_bytes());
        let hex: String = digest.iter().map(|byte| format!("{byte:02x}")).collect();
        self.cache_dir.join(format!("{hex}.json"))
    }

    fn read_cache(&self, url: &Url) -> Option<CacheEntry> {
        let text = fs::read_to_string(self.cache_path(url)).ok()?;
        serde_json::from_str(&text).ok()
    }

    /// A cache write that fails only costs the next request a refetch, so it never errors.
    fn write_cache(&self, entry: &CacheEntry) -> Option<()> {
        let path = self.cache_path(&Url::parse(&entry.url).ok()?);
        fs::create_dir_all(&self.cache_dir).ok()?;
        let text = serde_json::to_string(entry).ok()?;
        let tmp = path.with_extension(format!("json.tmp-{}", std::process::id()));
        fs::write(&tmp, text).ok()?;
        fs::rename(&tmp, &path).ok()
    }

    fn log(&self, level: u8, line: &str) {
        if self.verbosity >= level {
            eprintln!("duyet: {}", self.redactor.redact(line));
        }
    }

    /// GET with a disk cache (ETag + `Cache-Control: max-age`) and three attempts with
    /// exponential backoff on connect errors and 5xx. 4xx never retries.
    pub fn get(&self, url: &Url) -> Result<Fetched, CliError> {
        let cached = self.read_cache(url);
        let now = unix_now();
        if self.offline {
            self.log(
                2,
                &format!(
                    "offline, cache {}",
                    if cached.is_some() { "hit" } else { "miss" }
                ),
            );
            return cached
                .map(|entry| fetched_from(entry, true))
                .ok_or_else(|| CliError::Offline {
                    url: url.to_string(),
                });
        }
        if let Some(entry) = cached.as_ref().filter(|entry| entry.fresh(now)) {
            self.log(2, &format!("cache fresh for {url}"));
            return Ok(fetched_from(entry.clone(), true));
        }

        let response =
            self.send_with_retry(url, cached.as_ref().and_then(|e| e.etag.as_deref()))?;
        let status = response.status();
        let headers = response.headers().clone();
        let request_id = request_id(&headers);

        if status == StatusCode::NOT_MODIFIED {
            if let Some(mut entry) = cached {
                self.log(2, &format!("revalidated {url} (304)"));
                entry.fetched_at = now;
                entry.max_age = max_age(&headers).unwrap_or(entry.max_age);
                entry.request_id = request_id.or(entry.request_id);
                self.write_cache(&entry);
                return Ok(fetched_from(entry, true));
            }
        }
        if !status.is_success() {
            return Err(CliError::Http {
                url: url.to_string(),
                status: status.as_u16(),
                request_id,
            });
        }
        let etag = headers
            .get(ETAG)
            .and_then(|value| value.to_str().ok())
            .map(str::to_owned);
        let body = response.text().map_err(|err| CliError::Network {
            url: url.to_string(),
            message: describe(&err),
            request_id: request_id.clone(),
        })?;
        let entry = CacheEntry {
            url: url.to_string(),
            body,
            etag,
            fetched_at: now,
            max_age: max_age(&headers).unwrap_or(0),
            request_id,
        };
        self.write_cache(&entry);
        self.log(2, &format!("cached {url} for {}s", entry.max_age));
        Ok(fetched_from(entry, false))
    }

    fn send_with_retry(&self, url: &Url, etag: Option<&str>) -> Result<Response, CliError> {
        let mut attempt = 0;
        loop {
            attempt += 1;
            let mut request = self.client.get(url.clone());
            if let Some(etag) = etag {
                request = request.header(IF_NONE_MATCH, etag);
            }
            let started = Instant::now();
            let outcome = request.send();
            let elapsed = started.elapsed().as_millis();
            let retry = match &outcome {
                Ok(response) => {
                    self.log(
                        1,
                        &format!("GET {url} -> {} {elapsed}ms", response.status().as_u16()),
                    );
                    response.status().is_server_error()
                }
                Err(err) => {
                    self.log(
                        1,
                        &format!("GET {url} -> error {elapsed}ms: {}", describe(err)),
                    );
                    err.is_connect() || err.is_timeout() || err.is_request()
                }
            };
            if !retry || attempt >= ATTEMPTS {
                return outcome.map_err(|err| CliError::Network {
                    url: url.to_string(),
                    message: describe(&err),
                    request_id: None,
                });
            }
            let backoff = BACKOFF_BASE * 2u32.pow(attempt - 1);
            self.log(
                2,
                &format!("retry {attempt}/{ATTEMPTS} after {}ms", backoff.as_millis()),
            );
            thread::sleep(backoff);
        }
    }

    /// HEAD, falling back to GET on 405. Never errors: `doctor` reports whatever it saw.
    pub fn probe(&self, url: &Url) -> Probe {
        if self.offline {
            return Probe {
                url: url.to_string(),
                status: ProbeStatus::Skipped { reason: "offline" },
                latency_ms: None,
            };
        }
        let timeout = self.timeout.min(PROBE_TIMEOUT);
        let started = Instant::now();
        let mut outcome = self
            .client
            .request(Method::HEAD, url.clone())
            .timeout(timeout)
            .send();
        if matches!(&outcome, Ok(response) if response.status() == StatusCode::METHOD_NOT_ALLOWED) {
            outcome = self.client.get(url.clone()).timeout(timeout).send();
        }
        let latency_ms = u64::try_from(started.elapsed().as_millis()).unwrap_or(u64::MAX);
        let status = match outcome {
            Ok(response) => {
                self.log(
                    1,
                    &format!(
                        "HEAD {url} -> {} {latency_ms}ms",
                        response.status().as_u16()
                    ),
                );
                ProbeStatus::Reachable {
                    status: response.status().as_u16(),
                }
            }
            Err(err) => {
                self.log(
                    1,
                    &format!("HEAD {url} -> error {latency_ms}ms: {}", describe(&err)),
                );
                ProbeStatus::Unreachable {
                    message: self.redactor.redact(&describe(&err)),
                }
            }
        };
        Probe {
            url: url.to_string(),
            status,
            latency_ms: Some(latency_ms),
        }
    }
}

/// reqwest's top-level message hides the cause ("error sending request"); the root of the chain
/// is the part a user can act on ("Connection refused").
fn describe(err: &reqwest::Error) -> String {
    let mut message = err.to_string();
    let mut source = std::error::Error::source(err);
    while let Some(cause) = source {
        message = cause.to_string();
        source = cause.source();
    }
    if err.is_timeout() && !message.contains("timed out") {
        message = format!("timed out: {message}");
    }
    message
}

fn fetched_from(entry: CacheEntry, from_cache: bool) -> Fetched {
    Fetched {
        body: entry.body,
        from_cache,
        etag: entry.etag,
        request_id: entry.request_id,
    }
}

fn unix_now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn request_id(headers: &HeaderMap) -> Option<String> {
    ["x-request-id", "cf-ray"]
        .iter()
        .find_map(|name| headers.get(*name))
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned)
}

fn max_age(headers: &HeaderMap) -> Option<u64> {
    let value = headers.get(CACHE_CONTROL)?.to_str().ok()?;
    value
        .split(',')
        .map(str::trim)
        .find_map(|directive| directive.strip_prefix("max-age="))
        .and_then(|secs| secs.trim().parse().ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn headers(pairs: &[(&'static str, &str)]) -> HeaderMap {
        let mut map = HeaderMap::new();
        for (name, value) in pairs {
            map.insert(*name, value.parse().unwrap());
        }
        map
    }

    #[test]
    fn parses_max_age_and_request_id() {
        let map = headers(&[
            ("cache-control", "public, max-age=60, must-revalidate"),
            ("cf-ray", "ray-1"),
        ]);
        assert_eq!(max_age(&map), Some(60));
        assert_eq!(request_id(&map).as_deref(), Some("ray-1"));

        let map = headers(&[("x-request-id", "req-1"), ("cf-ray", "ray-1")]);
        assert_eq!(request_id(&map).as_deref(), Some("req-1"));
        assert_eq!(max_age(&map), None);
        assert_eq!(max_age(&headers(&[("cache-control", "no-store")])), None);
    }

    #[test]
    fn freshness_uses_max_age() {
        let entry = CacheEntry {
            url: "http://x/".into(),
            body: String::new(),
            etag: None,
            fetched_at: 1_000,
            max_age: 60,
            request_id: None,
        };
        assert!(entry.fresh(1_059));
        assert!(!entry.fresh(1_060));
        assert!(
            !CacheEntry {
                max_age: 0,
                ..entry
            }
            .fresh(1_000)
        );
    }

    #[test]
    fn probe_status_serializes_with_kind_tag() {
        let value = serde_json::to_value(ProbeStatus::Skipped { reason: "offline" }).unwrap();
        assert_eq!(value["kind"], "skipped");
        assert_eq!(value["reason"], "offline");
        let value = serde_json::to_value(ProbeStatus::Reachable { status: 200 }).unwrap();
        assert_eq!(value["kind"], "reachable");
        assert_eq!(value["status"], 200);
    }
}

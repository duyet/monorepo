use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::net::TcpListener;
use std::path::{Path, PathBuf};
use std::process::{Command, Output, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

use clap::Parser;
use duyet::cli::Cli;
use duyet::config::Settings;
use duyet::error::CliError;
use duyet::http::{CacheEntry, Http};
use duyet::paths::Paths;
use tempfile::TempDir;

const BIN: &str = env!("CARGO_BIN_EXE_duyet");

struct Sandbox {
    config_dir: TempDir,
    cache_dir: TempDir,
}

impl Sandbox {
    fn new() -> Sandbox {
        Sandbox {
            config_dir: tempfile::tempdir().unwrap(),
            cache_dir: tempfile::tempdir().unwrap(),
        }
    }

    fn config_file(&self) -> PathBuf {
        self.config_dir.path().join("config.toml")
    }

    fn cmd(&self) -> Command {
        let mut cmd = Command::new(BIN);
        cmd.env_clear()
            .env("PATH", std::env::var_os("PATH").unwrap_or_default())
            .env("HOME", self.config_dir.path())
            .env("LANG", "C")
            .env("DUYET_CONFIG_DIR", self.config_dir.path())
            .env("DUYET_CACHE_DIR", self.cache_dir.path());
        cmd
    }

    fn run(&self, args: &[&str]) -> Output {
        self.cmd().args(args).output().unwrap()
    }

    fn json(&self, args: &[&str]) -> (serde_json::Value, i32) {
        let output = self.run(args);
        let stdout = String::from_utf8(output.stdout).unwrap();
        let value: serde_json::Value = serde_json::from_str(stdout.trim())
            .unwrap_or_else(|err| panic!("not JSON ({err}): {stdout:?}"));
        (value, output.status.code().unwrap())
    }
}

fn stdout(output: &Output) -> String {
    String::from_utf8(output.stdout.clone()).unwrap()
}

fn stderr(output: &Output) -> String {
    String::from_utf8(output.stderr.clone()).unwrap()
}

fn exit(output: &Output) -> i32 {
    output.status.code().unwrap()
}

fn golden(path: &str, actual: &str) {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join(path);
    if std::env::var_os("UPDATE_GOLDEN").is_some() {
        fs::write(&path, actual).unwrap();
        return;
    }
    let expected = fs::read_to_string(&path)
        .unwrap_or_else(|err| panic!("{}: {err}; run UPDATE_GOLDEN=1 cargo test", path.display()));
    assert_eq!(
        actual,
        expected,
        "{} is stale; run UPDATE_GOLDEN=1 cargo test -p duyet",
        path.display()
    );
}

#[test]
fn help_lists_every_group_and_matches_golden() {
    let sb = Sandbox::new();
    let output = sb.run(&["--help"]);
    assert_eq!(exit(&output), 0);
    let text = stdout(&output);
    for group in [
        "posts",
        "notes",
        "series",
        "kb",
        "news",
        "images",
        "insights",
        "chat",
        "contact",
        "jd",
        "comment",
        "auth",
        "config",
        "update",
        "doctor",
        "version",
        "completions",
        "docs",
    ] {
        assert!(text.contains(&format!("\n  {group} ")), "missing {group}");
    }
    assert!(!text.contains(env!("CARGO_PKG_VERSION")));
    golden("tests/golden/help.txt", &text);
}

#[test]
fn docs_tree_and_markdown_match_committed_copies() {
    let sb = Sandbox::new();
    let tree = sb.run(&["docs", "tree"]);
    assert_eq!(exit(&tree), 0);
    let tree = stdout(&tree);
    assert!(tree.starts_with("duyet  "));
    assert!(tree.contains("\nduyet posts list  "));
    assert!(tree.contains("\nduyet update  "));
    assert!(!tree.contains("duyet help"));
    golden("tests/golden/tree.txt", &tree);

    let markdown = sb.run(&["docs", "markdown"]);
    assert_eq!(exit(&markdown), 0);
    let markdown = stdout(&markdown);
    assert!(markdown.contains("## `duyet config set`"));
    golden("docs/reference.md", &markdown);
}

#[test]
fn docs_man_writes_one_page_per_command() {
    let sb = Sandbox::new();
    let out = sb.cache_dir.path().join("man");
    let (value, code) = sb.json(&["docs", "man", "--out", out.to_str().unwrap(), "--json"]);
    assert_eq!(code, 0);
    assert_eq!(value["schema"], "duyet.docs_man.v1");
    let files: Vec<&str> = value["data"]["files"]
        .as_array()
        .unwrap()
        .iter()
        .map(|f| f.as_str().unwrap())
        .collect();
    assert!(files.contains(&"duyet.1"));
    assert!(files.contains(&"duyet-posts-list.1"));
    assert!(files.contains(&"duyet-config-doctor.1"));
    assert!(out.join("duyet-posts-list.1").exists());
    let page = fs::read_to_string(out.join("duyet-posts-list.1")).unwrap();
    assert!(page.contains(".TH"));
}

#[test]
fn version_human_and_json() {
    let sb = Sandbox::new();
    let output = sb
        .cmd()
        .args(["version"])
        .env("NO_COLOR", "1")
        .output()
        .unwrap();
    assert_eq!(exit(&output), 0);
    let text = stdout(&output);
    assert_eq!(text.lines().count(), 4);
    assert!(text.starts_with(&format!("duyet {}\n", env!("CARGO_PKG_VERSION"))));
    assert!(!output.stdout.contains(&0x1b));

    let output = sb
        .cmd()
        .args(["version"])
        .env("TERM", "dumb")
        .output()
        .unwrap();
    assert!(!output.stdout.contains(&0x1b));

    let (value, code) = sb.json(&["version", "--json"]);
    assert_eq!(code, 0);
    let keys: Vec<&str> = value
        .as_object()
        .unwrap()
        .keys()
        .map(String::as_str)
        .collect();
    assert_eq!(keys, ["data", "ok", "schema"]);
    assert_eq!(value["ok"], true);
    assert_eq!(value["schema"], "duyet.version.v1");
    assert_eq!(value["data"]["version"], env!("CARGO_PKG_VERSION"));
    assert_eq!(value["data"]["channel"], "stable");
    assert!(value["data"]["target"].as_str().unwrap().contains('-'));
    assert!(!value["data"]["commit"].as_str().unwrap().is_empty());
}

#[test]
fn stubs_exit_2_with_tracking_issue() {
    let sb = Sandbox::new();
    let cases: [(&[&str], u32); 3] = [
        (&["chat"], 1445),
        (&["auth", "status"], 1445),
        (&["update", "--check"], 1447),
    ];
    for (args, issue) in cases {
        let output = sb.run(args);
        assert_eq!(exit(&output), 2, "{args:?}");
        assert!(stdout(&output).is_empty(), "{args:?}");
        assert!(
            stderr(&output).contains(&format!("not implemented yet, tracked in #{issue}")),
            "{args:?}: {}",
            stderr(&output)
        );

        let mut json_args = args.to_vec();
        json_args.push("--json");
        let (value, code) = sb.json(&json_args);
        assert_eq!(code, 2, "{args:?}");
        assert_eq!(value["ok"], false);
        assert_eq!(value["schema"], "duyet.error.v1");
        let error = &value["error"];
        assert_eq!(error["code"], "not_implemented");
        assert_eq!(error["exit_code"], 2);
        assert!(
            error["message"]
                .as_str()
                .unwrap()
                .ends_with(&format!("#{issue}"))
        );
        assert!(
            error["tracking"]
                .as_str()
                .unwrap()
                .ends_with(&format!("/issues/{issue}"))
        );
        let keys: Vec<&str> = error
            .as_object()
            .unwrap()
            .keys()
            .map(String::as_str)
            .collect();
        assert_eq!(
            keys,
            ["code", "exit_code", "message", "remediation", "tracking"]
        );
    }
}

#[test]
fn clap_usage_error_becomes_envelope_with_json() {
    let sb = Sandbox::new();
    let (value, code) = sb.json(&["posts", "--json", "--bogus"]);
    assert_eq!(code, 2);
    assert_eq!(value["ok"], false);
    assert_eq!(value["error"]["code"], "usage");
    assert!(
        value["error"]["message"]
            .as_str()
            .unwrap()
            .contains("--bogus")
    );

    let output = sb.run(&["posts", "--bogus"]);
    assert_eq!(exit(&output), 2);
    assert!(stdout(&output).is_empty());
    assert!(stderr(&output).contains("--bogus"));
}

#[test]
fn config_round_trip() {
    let sb = Sandbox::new();
    let (value, code) = sb.json(&["config", "path", "--json"]);
    assert_eq!(code, 0);
    assert_eq!(value["data"]["exists"], false);
    assert_eq!(
        value["data"]["path"].as_str().unwrap(),
        sb.config_file().to_str().unwrap()
    );
    let output = sb.run(&["config", "path"]);
    assert_eq!(stdout(&output).trim(), sb.config_file().to_str().unwrap());

    let output = sb.run(&["config", "set", "blog_url", "http://127.0.0.1:1"]);
    assert_eq!(exit(&output), 0, "{}", stderr(&output));
    let file = fs::read_to_string(sb.config_file()).unwrap();
    assert_eq!(file, "blog_url = \"http://127.0.0.1:1/\"\n");

    let (value, _) = sb.json(&["config", "show", "--json"]);
    assert_eq!(value["schema"], "duyet.config.v1");
    assert_eq!(value["data"]["exists"], true);
    let blog = &value["data"]["values"]["blog_url"];
    assert_eq!(blog["value"], "http://127.0.0.1:1/");
    assert_eq!(blog["source"], "file");
    assert_eq!(value["data"]["values"]["kb_url"]["source"], "default");
    assert_eq!(value["data"]["values"]["output"]["source"], "flag");
    let keys: Vec<&str> = value["data"]["values"]
        .as_object()
        .unwrap()
        .keys()
        .map(String::as_str)
        .collect();
    assert_eq!(keys.len(), 9);
    assert!(keys.windows(2).all(|pair| pair[0] < pair[1]), "sorted keys");

    let output = sb
        .cmd()
        .args(["config", "show", "--json"])
        .env("DUYET_KB_URL", "https://kb.example.test")
        .output()
        .unwrap();
    let value: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(value["data"]["values"]["kb_url"]["source"], "env");
    assert_eq!(
        value["data"]["values"]["kb_url"]["value"],
        "https://kb.example.test/"
    );

    let output = sb.run(&["config", "set", "--dry-run", "channel", "beta"]);
    assert_eq!(exit(&output), 0);
    assert!(stdout(&output).contains("channel = \"beta\""));
    assert_eq!(
        fs::read_to_string(sb.config_file()).unwrap(),
        "blog_url = \"http://127.0.0.1:1/\"\n",
        "dry run must not write"
    );
    let (value, _) = sb.json(&["config", "set", "--dry-run", "channel", "beta", "--json"]);
    assert_eq!(value["schema"], "duyet.config_write.v1");
    assert_eq!(value["data"]["dry_run"], true);
    assert!(value["data"]["toml"].as_str().unwrap().contains("beta"));

    for expected_changed in [true, false] {
        let (value, code) = sb.json(&["config", "unset", "blog_url", "--json"]);
        assert_eq!(code, 0);
        assert_eq!(value["data"]["changed"], expected_changed);
        assert!(value["data"].get("value").is_none());
    }
    assert_eq!(fs::read_to_string(sb.config_file()).unwrap(), "");

    let (value, code) = sb.json(&["config", "set", "blog_url", "not a url", "--json"]);
    assert_eq!(code, 2);
    assert_eq!(value["error"]["code"], "config_invalid_value");

    let (value, code) = sb.json(&["config", "set", "nope", "1", "--json"]);
    assert_eq!(code, 2);
    assert_eq!(value["error"]["code"], "config_unknown_key");
    let remediation = value["error"]["remediation"].as_str().unwrap();
    for key in ["blog_url", "update.check", "telemetry"] {
        assert!(remediation.contains(key), "{remediation}");
    }

    let output = sb.run(&["config", "set", "update.check", "false"]);
    assert_eq!(exit(&output), 0);
    assert_eq!(
        fs::read_to_string(sb.config_file()).unwrap(),
        "[update]\ncheck = false\n"
    );
    let (value, _) = sb.json(&["config", "show", "--json"]);
    assert_eq!(value["data"]["values"]["update.check"]["value"], "false");
    assert_eq!(value["data"]["values"]["update.check"]["source"], "file");
}

#[test]
fn config_doctor_flags_secret_looking_key_without_echoing_it() {
    let sb = Sandbox::new();
    let output = sb.run(&["config", "doctor"]);
    assert_eq!(exit(&output), 0, "{}", stderr(&output));

    fs::write(sb.config_file(), "token = \"abc-secret-value\"\n").unwrap();
    let output = sb.run(&["config", "doctor"]);
    assert_eq!(exit(&output), 1);
    let err = stderr(&output);
    assert!(err.contains("token"), "{err}");
    assert!(!err.contains("abc-secret-value"), "{err}");

    let (value, code) = sb.json(&["config", "doctor", "--json"]);
    assert_eq!(code, 1);
    assert_eq!(value["error"]["code"], "config_invalid");
    assert!(
        !serde_json::to_string(&value)
            .unwrap()
            .contains("abc-secret-value")
    );

    fs::write(sb.config_file(), "channel = [\n").unwrap();
    let (value, code) = sb.json(&["config", "doctor", "--json"]);
    assert_eq!(code, 1, "doctor must still run on an unparsable file");
    assert_eq!(value["error"]["code"], "config_invalid");
    let output = sb.run(&["version"]);
    assert_eq!(exit(&output), 1, "other commands refuse a broken file");
    assert!(stderr(&output).contains("parse error"));
}

#[test]
fn doctor_redacts_token_and_skips_probes_offline() {
    let sb = Sandbox::new();
    let output = sb
        .cmd()
        .args(["doctor", "--json", "--offline"])
        .env("DUYET_AGENT_TOKEN", "sk-fake-123")
        .output()
        .unwrap();
    assert_eq!(exit(&output), 0, "{}", stderr(&output));
    let text = stdout(&output);
    assert!(!text.contains("sk-fake-123"));
    assert!(!stderr(&output).contains("sk-fake-123"));
    let value: serde_json::Value = serde_json::from_str(text.trim()).unwrap();
    assert_eq!(value["ok"], true);
    assert_eq!(value["schema"], "duyet.doctor.v1");
    assert_eq!(value["data"]["agent_token"], "set");
    assert_eq!(value["data"]["offline"], true);
    let endpoints = value["data"]["endpoints"].as_array().unwrap();
    assert_eq!(endpoints.len(), 5);
    for endpoint in endpoints {
        assert_eq!(endpoint["status"]["kind"], "skipped");
        assert_eq!(endpoint["status"]["reason"], "offline");
    }

    let output = sb
        .cmd()
        .args(["doctor"])
        .env("DUYET_OFFLINE", "1")
        .output()
        .unwrap();
    assert_eq!(exit(&output), 0);
    assert_eq!(stdout(&output).matches("skipped (offline)").count(), 5);
    let (value, _) = sb.json(&["doctor", "--json", "--offline"]);
    assert_eq!(value["data"]["agent_token"], "unset");
}

#[test]
fn doctor_reports_unreachable_endpoint_and_exits_0() {
    let sb = Sandbox::new();
    assert_eq!(
        exit(&sb.run(&["config", "set", "blog_url", "http://127.0.0.1:1"])),
        0
    );
    let output = sb
        .cmd()
        .args(["doctor", "--json"])
        .env("DUYET_KB_URL", "http://127.0.0.1:1/kb")
        .env("DUYET_API_URL", "http://127.0.0.1:1/api")
        .env("DUYET_AGENTS_API_URL", "http://127.0.0.1:1/agents")
        .env("DUYET_NEWS_URL", "http://127.0.0.1:1/news")
        .output()
        .unwrap();
    assert_eq!(exit(&output), 0, "{}", stderr(&output));
    let value: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(value["ok"], true);
    let blog = &value["data"]["endpoints"][0];
    assert_eq!(blog["url"], "http://127.0.0.1:1/");
    assert_eq!(blog["status"]["kind"], "unreachable");
    assert!(blog["status"]["message"].as_str().unwrap().len() > 5);
    assert!(blog["latency_ms"].is_u64());
}

#[test]
fn completions_generate_for_every_shell() {
    let sb = Sandbox::new();
    for shell in ["bash", "zsh", "fish", "powershell"] {
        let output = sb.run(&["completions", shell]);
        assert_eq!(exit(&output), 0, "{shell}");
        assert!(stdout(&output).contains("duyet"), "{shell}");
    }
    let output = sb.run(&["completions", "zsh"]);
    assert!(stdout(&output).starts_with("#compdef duyet"));
}

#[test]
fn reader_hanging_up_is_a_quiet_exit_0() {
    let sb = Sandbox::new();
    for args in [
        &["completions", "zsh"][..],
        &["docs", "markdown"],
        &["docs", "tree"],
        &["config", "show"],
    ] {
        let mut child = sb
            .cmd()
            .args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .unwrap();
        drop(child.stdout.take());
        let output = child.wait_with_output().unwrap();
        assert_eq!(exit(&output), 0, "{args:?}");
        assert_eq!(stderr(&output), "", "{args:?}");
    }
}

struct Scripted {
    status: u16,
    headers: Vec<(&'static str, String)>,
    body: &'static str,
}

fn scripted(status: u16, headers: &[(&'static str, &str)], body: &'static str) -> Scripted {
    Scripted {
        status,
        headers: headers.iter().map(|(k, v)| (*k, (*v).to_owned())).collect(),
        body,
    }
}

/// Serves each scripted response to one connection, in order, recording request lines.
fn serve(responses: Vec<Scripted>) -> (url::Url, Arc<Mutex<Vec<String>>>) {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = listener.local_addr().unwrap();
    let requests = Arc::new(Mutex::new(Vec::new()));
    let seen = Arc::clone(&requests);
    thread::spawn(move || {
        for response in responses {
            let (mut stream, _) = listener.accept().unwrap();
            let mut reader = BufReader::new(stream.try_clone().unwrap());
            let mut head = String::new();
            loop {
                let mut line = String::new();
                if reader.read_line(&mut line).unwrap() == 0 || line == "\r\n" {
                    break;
                }
                head.push_str(&line);
            }
            seen.lock().unwrap().push(head);
            let mut text = format!("HTTP/1.1 {} X\r\nConnection: close\r\n", response.status);
            for (name, value) in &response.headers {
                text.push_str(&format!("{name}: {value}\r\n"));
            }
            text.push_str(&format!(
                "Content-Length: {}\r\n\r\n{}",
                response.body.len(),
                response.body
            ));
            stream.write_all(text.as_bytes()).unwrap();
            stream.flush().unwrap();
        }
    });
    (
        url::Url::parse(&format!("http://{addr}/data.json")).unwrap(),
        requests,
    )
}

fn http(cache_dir: &Path, offline: bool) -> Http {
    let mut args = vec!["duyet", "--timeout", "5"];
    if offline {
        args.push("--offline");
    }
    args.push("version");
    let cli = Cli::try_parse_from(args).unwrap();
    let paths = Paths {
        config_file: cache_dir.join("config.toml"),
        cache_dir: cache_dir.to_path_buf(),
        data_dir: cache_dir.to_path_buf(),
    };
    let settings = Settings::resolve(None, &cli.globals).unwrap();
    Http::new(&paths, &cli.globals, &settings).unwrap()
}

#[test]
fn http_get_caches_by_max_age_and_revalidates_with_etag() {
    let dir = tempfile::tempdir().unwrap();
    let (url, requests) = serve(vec![
        scripted(
            200,
            &[
                ("ETag", "\"a\""),
                ("Cache-Control", "max-age=60"),
                ("x-request-id", "req-1"),
            ],
            "{\"v\":1}",
        ),
        scripted(304, &[("ETag", "\"a\"")], ""),
    ]);
    let http = http(dir.path(), false);

    let first = http.get(&url).unwrap();
    assert!(!first.from_cache);
    assert_eq!(first.body, "{\"v\":1}");
    assert_eq!(first.etag.as_deref(), Some("\"a\""));
    assert_eq!(first.request_id.as_deref(), Some("req-1"));

    let second = http.get(&url).unwrap();
    assert!(second.from_cache, "fresh entry served without a request");
    assert_eq!(requests.lock().unwrap().len(), 1);

    let path = http.cache_path(&url);
    let mut entry: CacheEntry = serde_json::from_str(&fs::read_to_string(&path).unwrap()).unwrap();
    entry.fetched_at = 0;
    fs::write(&path, serde_json::to_string(&entry).unwrap()).unwrap();

    let third = http.get(&url).unwrap();
    assert!(third.from_cache, "304 serves the cached body");
    assert_eq!(third.body, "{\"v\":1}");
    let requests = requests.lock().unwrap();
    assert_eq!(requests.len(), 2);
    assert!(
        requests[1].to_lowercase().contains("if-none-match: \"a\""),
        "{}",
        requests[1]
    );
    assert!(requests[1].to_lowercase().contains("user-agent: duyet/"));
}

#[test]
fn http_get_retries_5xx_then_succeeds() {
    let dir = tempfile::tempdir().unwrap();
    let (url, requests) = serve(vec![
        scripted(503, &[], "busy"),
        scripted(503, &[], "busy"),
        scripted(200, &[], "ok"),
    ]);
    let fetched = http(dir.path(), false).get(&url).unwrap();
    assert_eq!(fetched.body, "ok");
    assert!(!fetched.from_cache);
    assert_eq!(requests.lock().unwrap().len(), 3);
}

#[test]
fn http_get_never_retries_4xx_and_maps_404_to_not_found() {
    let dir = tempfile::tempdir().unwrap();
    let (url, requests) = serve(vec![scripted(404, &[("cf-ray", "ray-9")], "nope")]);
    let err = http(dir.path(), false).get(&url).unwrap_err();
    assert!(matches!(err, CliError::Http { status: 404, .. }), "{err:?}");
    assert_eq!(err.exit_code() as u8, 6);
    assert_eq!(err.code(), "http_404");
    assert_eq!(err.request_id(), Some("ray-9"));
    assert_eq!(requests.lock().unwrap().len(), 1);
}

#[test]
fn minisign_pub_is_embedded() {
    let key = duyet::MINISIGN_PUB;
    assert!(key.starts_with("untrusted comment: minisign public key"));
    assert!(key.contains("RWS"));
    let home = include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../apps/home/public/cli/minisign.pub"
    ));
    assert_eq!(key, home);
}

#[test]
fn http_offline_serves_cache_or_fails() {
    let dir = tempfile::tempdir().unwrap();
    let url = url::Url::parse("http://127.0.0.1:1/never").unwrap();
    let err = http(dir.path(), true).get(&url).unwrap_err();
    assert!(matches!(err, CliError::Offline { .. }), "{err:?}");
    assert_eq!(err.exit_code() as u8, 3);

    let (url, _) = serve(vec![scripted(
        200,
        &[("Cache-Control", "max-age=0")],
        "seed",
    )]);
    let online = http(dir.path(), false);
    assert!(!online.get(&url).unwrap().from_cache);
    let offline = http(dir.path(), true).get(&url).unwrap();
    assert!(offline.from_cache);
    assert_eq!(offline.body, "seed");
}

fn origin(url: &url::Url) -> String {
    let mut origin = url.clone();
    origin.set_path("/");
    origin.set_query(None);
    origin.to_string()
}

#[test]
fn contact_invalid_email_exits_2_with_no_request() {
    let sb = Sandbox::new();
    let (url, requests) = serve(vec![scripted(202, &[], r#"{"id":"x"}"#)]);
    let output = sb
        .cmd()
        .args([
            "contact",
            "--name",
            "Ada",
            "--email",
            "not-an-email",
            "--message",
            "hi",
            "--yes",
        ])
        .env("DUYET_API_URL", origin(&url))
        .output()
        .unwrap();
    assert_eq!(exit(&output), 2, "{}", stderr(&output));
    assert!(stderr(&output).contains("invalid email"));
    assert!(requests.lock().unwrap().is_empty());
}

#[test]
fn contact_declined_confirm_exits_5_with_no_request() {
    let sb = Sandbox::new();
    let (url, requests) = serve(vec![scripted(202, &[], r#"{"id":"x"}"#)]);
    let output = sb
        .cmd()
        .args([
            "contact",
            "--name",
            "Ada",
            "--email",
            "ada@example.com",
            "--message",
            "hi",
            "--no-input",
        ])
        .env("DUYET_API_URL", origin(&url))
        .output()
        .unwrap();
    assert_eq!(exit(&output), 5, "{}", stderr(&output));
    assert!(stderr(&output).contains("POST "));
    assert!(stderr(&output).contains("ada@example.com"));
    assert!(requests.lock().unwrap().is_empty());
}

#[test]
fn contact_yes_sends_once_and_json_omits_payload() {
    let sb = Sandbox::new();
    let (url, requests) = serve(vec![scripted(
        202,
        &[],
        r#"{"id":"sub-1","status":"pending"}"#,
    )]);
    let output = sb
        .cmd()
        .args([
            "contact",
            "--name",
            "Ada",
            "--email",
            "ada@example.com",
            "--message",
            "hi",
            "--yes",
            "--json",
        ])
        .env("DUYET_API_URL", origin(&url))
        .output()
        .unwrap();
    assert_eq!(exit(&output), 0, "{}", stderr(&output));
    let value: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(value["ok"], true);
    assert_eq!(value["schema"], "duyet.submission.v1");
    assert_eq!(value["data"]["id"], "sub-1");
    assert_eq!(value["data"]["kind"], "contact");
    assert!(value["data"]["accepted_at"].as_str().unwrap().ends_with('Z'));
    let stdout = stdout(&output);
    assert!(!stdout.contains("ada@example.com"));
    assert!(!stdout.contains("\"message\""));
    assert_eq!(requests.lock().unwrap().len(), 1);
    assert!(
        requests.lock().unwrap()[0]
            .to_lowercase()
            .contains("idempotency-key:")
    );
}

#[test]
fn contact_429_prints_retry_after_and_exits_3() {
    let sb = Sandbox::new();
    let (url, _) = serve(vec![scripted(429, &[("Retry-After", "42")], r#"{}"#)]);
    let output = sb
        .cmd()
        .args([
            "contact",
            "--name",
            "Ada",
            "--email",
            "ada@example.com",
            "--message",
            "hi",
            "--yes",
        ])
        .env("DUYET_API_URL", origin(&url))
        .output()
        .unwrap();
    assert_eq!(exit(&output), 3, "{}", stderr(&output));
    assert!(
        stderr(&output).contains("Retry-After: 42"),
        "{}",
        stderr(&output)
    );
}

#[test]
fn jd_32kb_cap_exits_2_with_no_request() {
    let sb = Sandbox::new();
    let (url, requests) = serve(vec![scripted(202, &[], r#"{"id":"x"}"#)]);
    let path = sb.cache_dir.path().join("jd.txt");
    fs::write(&path, "x".repeat(32_769)).unwrap();
    let output = sb
        .cmd()
        .args(["jd", "submit", path.to_str().unwrap(), "--yes"])
        .env("DUYET_API_URL", origin(&url))
        .output()
        .unwrap();
    assert_eq!(exit(&output), 2, "{}", stderr(&output));
    assert!(stderr(&output).contains("32768"));
    assert!(requests.lock().unwrap().is_empty());
}

#[test]
fn jd_submit_file_yes_sends_text() {
    let sb = Sandbox::new();
    let (url, requests) = serve(vec![scripted(202, &[], r#"{"id":"jd-1"}"#)]);
    let path = sb.cache_dir.path().join("role.md");
    fs::write(&path, "hire a rust person").unwrap();
    let output = sb
        .cmd()
        .args([
            "jd",
            "submit",
            path.to_str().unwrap(),
            "--company",
            "Acme",
            "--yes",
        ])
        .env("DUYET_API_URL", origin(&url))
        .output()
        .unwrap();
    assert_eq!(exit(&output), 0, "{}", stderr(&output));
    assert_eq!(stdout(&output).trim(), "jd-1");
    assert_eq!(requests.lock().unwrap().len(), 1);
}

#[test]
fn comment_unknown_slug_exits_6_without_post() {
    let sb = Sandbox::new();
    let (blog, blog_reqs) = serve(vec![scripted(
        200,
        &[("Cache-Control", "max-age=3600")],
        r#"[{"slug":"/2026/08/grok-bot"}]"#,
    )]);
    let (api, api_reqs) = serve(vec![scripted(202, &[], r#"{"id":"c-1"}"#)]);
    let output = sb
        .cmd()
        .args([
            "comment",
            "2026/08/nope",
            "--body",
            "x",
            "--author",
            "Ada",
            "--yes",
        ])
        .env("DUYET_BLOG_URL", origin(&blog))
        .env("DUYET_API_URL", origin(&api))
        .output()
        .unwrap();
    assert_eq!(exit(&output), 6, "{}", stderr(&output));
    assert_eq!(blog_reqs.lock().unwrap().len(), 1);
    assert!(api_reqs.lock().unwrap().is_empty());
}

#[test]
fn comment_known_slug_posts_once() {
    let sb = Sandbox::new();
    let (blog, _) = serve(vec![scripted(
        200,
        &[("Cache-Control", "max-age=3600")],
        r#"[{"slug":"/2026/08/grok-bot"}]"#,
    )]);
    let (api, api_reqs) = serve(vec![scripted(202, &[], r#"{"id":"c-9"}"#)]);
    let output = sb
        .cmd()
        .args([
            "comment",
            "2026/08/grok-bot",
            "--body",
            "nice",
            "--author",
            "Ada",
            "--yes",
            "--json",
        ])
        .env("DUYET_BLOG_URL", origin(&blog))
        .env("DUYET_API_URL", origin(&api))
        .output()
        .unwrap();
    assert_eq!(exit(&output), 0, "{}", stderr(&output));
    let value: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(value["data"]["id"], "c-9");
    assert_eq!(value["data"]["kind"], "comment");
    assert!(!stdout(&output).contains("nice"));
    assert_eq!(api_reqs.lock().unwrap().len(), 1);
}

fn fixture(name: &str) -> String {
    fs::read_to_string(
        Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("tests/fixtures")
            .join(name),
    )
    .unwrap()
}

/// Serves GET paths from a map until the thread is dropped (bounded accepts).
fn serve_routes(routes: Vec<(&'static str, String)>) -> url::Url {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = listener.local_addr().unwrap();
    thread::spawn(move || {
        for _ in 0..64 {
            let Ok((mut stream, _)) = listener.accept() else {
                break;
            };
            let mut reader = BufReader::new(stream.try_clone().unwrap());
            let mut request = String::new();
            loop {
                let mut line = String::new();
                if reader.read_line(&mut line).unwrap() == 0 || line == "\r\n" {
                    break;
                }
                if request.is_empty() {
                    request = line;
                }
            }
            let path = request
                .split_whitespace()
                .nth(1)
                .unwrap_or("/")
                .split('?')
                .next()
                .unwrap_or("/");
            let body = routes
                .iter()
                .find(|(p, _)| *p == path)
                .map(|(_, b)| b.as_str());
            let (status, body) = match body {
                Some(body) => (200, body.as_bytes().to_vec()),
                None => (404, b"nope".to_vec()),
            };
            let text = format!(
                "HTTP/1.1 {status} X\r\nConnection: close\r\nContent-Length: {}\r\n\r\n",
                body.len()
            );
            stream.write_all(text.as_bytes()).ok();
            stream.write_all(&body).ok();
        }
    });
    url::Url::parse(&format!("http://{addr}/")).unwrap()
}

#[test]
fn content_commands_against_fixture_server() {
    let posts = fixture("posts-data.json");
    let content = fixture("posts-content/2026-08-grok-bot.json");
    let notes = fixture("notes-data.json");
    let llms = fixture("llms.txt");
    let news = fixture("api-public.json");
    let welcome = "---\ntitle: \"Welcome to the Knowledge Base\"\n---\n# Hi\n";
    let series = r#"[{"name":"AI Harness","slug":"ai-harness","posts":[{"slug":"/2026/08/grok-bot","title":"Grok Bot","date":"2026-08-19"}]}]"#;
    let insights = r#"{"cloudflare":{"generatedAt":"2026-09-15T00:00:00Z","totalRequests":9,"totalPageviews":3},"posthog":{"totalViews":1,"totalVisitors":1},"wakaMetrics":{"totalHours":2.5,"topLanguage":"Rust"},"aiMetrics":{"totalTokens":10,"totalCost":0.1}}"#;
    let img = "IMG";
    let origin = serve_routes(vec![
        ("/posts-data.json", posts),
        ("/posts-content/2026-08-grok-bot.json", content),
        ("/notes-data.json", notes),
        ("/series-data.json", series.into()),
        ("/llms.txt", llms),
        ("/k/welcome.md", welcome.into()),
        ("/api/public", news),
        ("/api/insights/overview", insights.into()),
        ("/media/a.jpg", img.into()),
        ("/media/b.jpg", img.into()),
        ("/media/c.jpg", img.into()),
        ("/media/hero.jpg", img.into()),
        (
            "/note/how-do-i-trust.md",
            "---\ntitle: How do I trust\n---\nbody\n".into(),
        ),
    ]);
    let sb = Sandbox::new();
    let base = origin.as_str().trim_end_matches('/').to_owned();
    let run_json = |args: &[&str]| {
        let mut cmd = sb.cmd();
        cmd.env("DUYET_BLOG_URL", &base)
            .env("DUYET_KB_URL", &base)
            .env("DUYET_NEWS_URL", &base)
            .env("DUYET_API_URL", &base)
            .args(args);
        let output = cmd.output().unwrap();
        let stdout = String::from_utf8(output.stdout).unwrap();
        let value: serde_json::Value =
            serde_json::from_str(stdout.trim()).unwrap_or_else(|err| panic!("{err}: {stdout}"));
        (value, output.status.code().unwrap(), stdout)
    };

    let (value, code, _) = run_json(&["posts", "list", "--json"]);
    assert_eq!(code, 0);
    assert_eq!(value["ok"], true);
    assert_eq!(value["data"]["items"].as_array().unwrap().len(), 2);
    assert_eq!(value["data"]["items"][0]["slug"], "2026/08/grok-bot");

    let (value, code, _) = run_json(&["posts", "search", "grok", "--json"]);
    assert_eq!(code, 0);
    assert!(
        value["data"]["items"][0]["slug"]
            .as_str()
            .unwrap()
            .contains("grok-bot")
    );

    let (value, code, _) = run_json(&["posts", "read", "no-such-post", "--json"]);
    assert_eq!(code, 6);
    assert_eq!(value["error"]["code"], "not_found");

    let out_dir = sb.cache_dir.path().join("imgs");
    let (value, code, _) = run_json(&[
        "posts",
        "read",
        "2026/08/grok-bot",
        "--images",
        out_dir.to_str().unwrap(),
        "--json",
    ]);
    assert_eq!(code, 0, "{value}");
    assert_eq!(value["data"]["title"], "Grok Bot");
    let written: Vec<_> = fs::read_dir(&out_dir)
        .unwrap()
        .filter_map(|e| e.ok())
        .collect();
    assert!(written.len() >= 3, "{written:?}");

    let (value, code, _) = run_json(&["notes", "list", "--json"]);
    assert_eq!(code, 0);
    assert_eq!(value["data"]["items"][0]["id"], "how-do-i-trust");

    let (value, code, _) = run_json(&["series", "read", "ai-harness", "--json"]);
    assert_eq!(code, 0);
    assert_eq!(value["data"]["posts"][0]["slug"], "2026/08/grok-bot");

    let (value, code, _) = run_json(&["kb", "list", "--json"]);
    assert_eq!(code, 0);
    assert_eq!(value["data"]["items"][0]["slug"], "welcome");

    let output = sb
        .cmd()
        .env("DUYET_KB_URL", &base)
        .args(["kb", "read", "welcome"])
        .output()
        .unwrap();
    assert_eq!(exit(&output), 0, "{}", stderr(&output));
    assert!(stdout(&output).contains("Welcome to the Knowledge Base"));

    let (value, code, _) = run_json(&["news", "today", "--json"]);
    assert_eq!(code, 0);
    assert_eq!(value["ok"], true);
    assert_eq!(value["data"]["date"], "2026-09-16");

    let (value, code, _) = run_json(&["insights", "overview", "--json"]);
    assert_eq!(code, 0);
    assert_eq!(value["data"]["cloudflare_requests"], 9);
}

#[test]
fn http_no_cache_skips_fresh_entry() {
    let dir = tempfile::tempdir().unwrap();
    let (url, requests) = serve(vec![
        scripted(200, &[("Cache-Control", "max-age=60")], "one"),
        scripted(200, &[("Cache-Control", "max-age=60")], "two"),
    ]);
    let first = http(dir.path(), false).get(&url).unwrap();
    assert_eq!(first.body, "one");
    let mut args = vec!["duyet", "--timeout", "5", "--no-cache", "version"];
    let cli = Cli::try_parse_from(args.drain(..)).unwrap();
    let paths = Paths {
        config_file: dir.path().join("config.toml"),
        cache_dir: dir.path().to_path_buf(),
        data_dir: dir.path().to_path_buf(),
    };
    let settings = Settings::resolve(None, &cli.globals).unwrap();
    let client = Http::new(&paths, &cli.globals, &settings).unwrap();
    let second = client.get(&url).unwrap();
    assert_eq!(second.body, "two");
    assert!(!second.from_cache);
    assert_eq!(requests.lock().unwrap().len(), 2);
}
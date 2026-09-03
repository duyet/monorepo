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
    let cases: [(&[&str], u32); 13] = [
        (&["posts", "list"], 1443),
        (&["notes", "list"], 1443),
        (&["series", "list"], 1443),
        (&["kb", "list"], 1443),
        (&["news", "today"], 1443),
        (&["images", "download", "x", "--out", "d"], 1443),
        (&["insights", "overview"], 1443),
        (&["chat"], 1445),
        (
            &["contact", "--name", "a", "--email", "b", "--message", "c"],
            1448,
        ),
        (&["jd", "submit", "f"], 1448),
        (&["comment", "s", "--body", "b"], 1448),
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

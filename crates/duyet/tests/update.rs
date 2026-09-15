use std::collections::HashMap;
use std::fs;
use std::io::{BufRead, BufReader, Cursor, Write};
use std::net::TcpListener;
use std::path::PathBuf;
use std::process::{Command, Output};
use std::sync::Arc;
use std::thread;

use flate2::Compression;
use flate2::write::GzEncoder;
use minisign::{KeyPair, PublicKeyBox};
use sha2::{Digest, Sha256};
use tempfile::TempDir;

const BIN: &str = env!("CARGO_BIN_EXE_duyet");

struct Fixture {
    _home: TempDir,
    _cache: TempDir,
    config: TempDir,
    install: PathBuf,
    pubkey: String,
    base: String,
}

impl Fixture {
    fn cmd(&self) -> Command {
        let mut cmd = Command::new(BIN);
        cmd.env_clear()
            .env("PATH", std::env::var_os("PATH").unwrap_or_default())
            .env("HOME", self._home.path())
            .env("LANG", "C")
            .env("DUYET_CONFIG_DIR", self.config.path())
            .env("DUYET_CACHE_DIR", self._cache.path())
            .env("DUYET_CLI_BASE_URL", &self.base)
            .env("DUYET_MINISIGN_PUB", &self.pubkey)
            .env("DUYET_NO_UPDATE_CHECK", "1")
            .env("DUYET_CURRENT_EXE", self.install.join("duyet"));
        cmd
    }

    fn run(&self, args: &[&str]) -> Output {
        self.cmd().args(args).output().unwrap()
    }
}

fn spawn_files(_files: HashMap<String, Vec<u8>>) -> (String, TcpListener) {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = listener.local_addr().unwrap();
    (format!("http://{addr}"), listener)
}

fn serve(listener: TcpListener, files: HashMap<String, Vec<u8>>) {
    let files = Arc::new(files);
    thread::spawn(move || loop {
        let Ok((mut stream, _)) = listener.accept() else {
            break;
        };
        let mut reader = BufReader::new(stream.try_clone().unwrap());
        let mut request = String::new();
        if reader.read_line(&mut request).unwrap_or(0) == 0 {
            continue;
        }
        loop {
            let mut line = String::new();
            if reader.read_line(&mut line).unwrap_or(0) == 0 || line == "\r\n" {
                break;
            }
        }
        let path = request
            .split_whitespace()
            .nth(1)
            .unwrap_or("/")
            .trim_start_matches('/')
            .to_owned();
        let body = files.get(&path).cloned().unwrap_or_default();
        let status = if files.contains_key(&path) {
            "200 OK"
        } else {
            "404 Not Found"
        };
        let header = format!(
            "HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
            body.len()
        );
        let _ = stream.write_all(header.as_bytes());
        let _ = stream.write_all(&body);
    });
}

fn pack_tar_gz(payload: &[u8]) -> Vec<u8> {
    let mut encoded = Vec::new();
    {
        let enc = GzEncoder::new(&mut encoded, Compression::default());
        let mut builder = tar::Builder::new(enc);
        let mut header = tar::Header::new_gnu();
        header.set_size(payload.len() as u64);
        header.set_mode(0o755);
        header.set_cksum();
        builder.append_data(&mut header, "duyet", payload).unwrap();
        builder.finish().unwrap();
    }
    encoded
}

fn sha256_hex(bytes: &[u8]) -> String {
    Sha256::digest(bytes)
        .iter()
        .map(|b| format!("{b:02x}"))
        .collect()
}

fn sign_sums(sk: &minisign::SecretKey, sums: &[u8]) -> String {
    minisign::sign(None, sk, Cursor::new(sums), None, None)
        .unwrap()
        .to_string()
}

fn keypair() -> (minisign::SecretKey, String) {
    let KeyPair { pk, sk } = KeyPair::generate_unencrypted_keypair().unwrap();
    let pk_box: PublicKeyBox = pk.to_box().unwrap();
    (sk, pk_box.to_string())
}

fn dist(
    version: &str,
    archive: Vec<u8>,
    sums: String,
    sig: String,
    pubkey: String,
    target: &str,
) -> Fixture {
    let (base, listener) = spawn_files(HashMap::new());
    let hash = sha256_hex(&archive);
    let archive_name = format!("duyet-{target}.tar.gz");
    let size = archive.len();
    let manifest = format!(
        r#"{{"version":"{version}","tag":"duyet-v{version}","targets":{{"{target}":{{"url":"{base}/{archive_name}","sha256":"{hash}","size":{size}}}}}}}"#
    );
    let mut files = HashMap::new();
    files.insert("stable.json".into(), manifest.clone().into_bytes());
    files.insert("beta.json".into(), manifest.into_bytes());
    files.insert(archive_name, archive);
    files.insert("SHA256SUMS".into(), sums.into_bytes());
    files.insert("SHA256SUMS.minisig".into(), sig.into_bytes());
    serve(listener, files);

    let home = tempfile::tempdir().unwrap();
    let cache = tempfile::tempdir().unwrap();
    let config = tempfile::tempdir().unwrap();
    let install = home.path().join(".duyet").join("bin");
    fs::create_dir_all(&install).unwrap();
    fs::copy(BIN, install.join("duyet")).unwrap();
    Fixture {
        _home: home,
        _cache: cache,
        config,
        install,
        pubkey,
        base,
    }
}

fn host_target() -> String {
    let output = Command::new(BIN)
        .args(["version", "--json"])
        .env("DUYET_NO_UPDATE_CHECK", "1")
        .output()
        .unwrap();
    let value: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    value["data"]["target"].as_str().unwrap().to_owned()
}

fn good_fixture() -> Fixture {
    let target = host_target();
    let archive = pack_tar_gz(b"#!/bin/sh\necho updated-payload\n");
    let name = format!("duyet-{target}.tar.gz");
    let sums = format!("{}  {name}\n", sha256_hex(&archive));
    let (sk, pk) = keypair();
    let sig = sign_sums(&sk, sums.as_bytes());
    dist("9.9.9", archive, sums, sig, pk, &target)
}

fn stdout(output: &Output) -> String {
    String::from_utf8_lossy(&output.stdout).into_owned()
}
fn stderr(output: &Output) -> String {
    String::from_utf8_lossy(&output.stderr).into_owned()
}
fn code(output: &Output) -> i32 {
    output.status.code().unwrap()
}

#[test]
fn check_exits_10_when_behind() {
    let fx = good_fixture();
    let output = fx.run(&["update", "--check", "--json"]);
    assert_eq!(code(&output), 10, "{}", stderr(&output));
    let value: serde_json::Value = serde_json::from_str(stdout(&output).trim()).unwrap();
    assert_eq!(value["ok"], true);
    assert_eq!(value["schema"], "duyet.update.v1");
    assert_eq!(value["data"]["latest"], "9.9.9");
    assert_eq!(value["data"]["update_available"], true);
}

#[test]
fn good_update_swap_rollback_and_double_rollback() {
    let fx = good_fixture();
    let output = fx.run(&["update", "--json"]);
    assert_eq!(code(&output), 0, "{}", stderr(&output));
    let value: serde_json::Value = serde_json::from_str(stdout(&output).trim()).unwrap();
    assert_eq!(value["data"]["to"], "9.9.9");
    assert_eq!(value["data"]["previous_kept"], true);
    let payload = fs::read(fx.install.join("duyet")).unwrap();
    assert!(payload.starts_with(b"#!/bin/sh"));
    assert!(fx.install.join("duyet.prev").exists());
    let versions: serde_json::Value =
        serde_json::from_str(&fs::read_to_string(fx.install.join("versions.json")).unwrap())
            .unwrap();
    assert_eq!(versions["current"], "9.9.9");
    assert_eq!(versions["channel"], "stable");

    let rb = fx.run(&["update", "--rollback", "--json"]);
    assert_eq!(code(&rb), 0, "{}", stderr(&rb));
    let value: serde_json::Value = serde_json::from_str(stdout(&rb).trim()).unwrap();
    assert_eq!(value["data"]["restored"], true);
    assert_eq!(
        fs::read(fx.install.join("duyet")).unwrap(),
        fs::read(BIN).unwrap()
    );

    let rb2 = fx.run(&["update", "--rollback", "--json"]);
    assert_eq!(code(&rb2), 0, "{}", stderr(&rb2));
    let value: serde_json::Value = serde_json::from_str(stdout(&rb2).trim()).unwrap();
    assert_eq!(value["data"]["restored"], false);
}

#[test]
fn bad_hash_keeps_old_binary() {
    let target = host_target();
    let archive = pack_tar_gz(b"new");
    let name = format!("duyet-{target}.tar.gz");
    let sums = format!("{}  {name}\n", "0".repeat(64));
    let (sk, pk) = keypair();
    let sig = sign_sums(&sk, sums.as_bytes());
    let fx = dist("9.9.9", archive, sums, sig, pk, &target);
    let before = fs::read(fx.install.join("duyet")).unwrap();
    let output = fx.run(&["update", "--json"]);
    assert_ne!(code(&output), 0, "{}", stdout(&output));
    let value: serde_json::Value = serde_json::from_str(stdout(&output).trim()).unwrap();
    assert_eq!(value["error"]["code"], "checksum_mismatch");
    assert_eq!(fs::read(fx.install.join("duyet")).unwrap(), before);
}

#[test]
fn bad_signature_rejected() {
    let target = host_target();
    let archive = pack_tar_gz(b"new");
    let name = format!("duyet-{target}.tar.gz");
    let sums = format!("{}  {name}\n", sha256_hex(&archive));
    let (_sk, pk) = keypair();
    let fx = dist("9.9.9", archive, sums, "not-a-signature".into(), pk, &target);
    let before = fs::read(fx.install.join("duyet")).unwrap();
    let output = fx.run(&["update", "--json"]);
    assert_ne!(code(&output), 0);
    let value: serde_json::Value = serde_json::from_str(stdout(&output).trim()).unwrap();
    assert_eq!(value["error"]["code"], "bad_signature");
    assert_eq!(fs::read(fx.install.join("duyet")).unwrap(), before);
}

#[test]
fn channel_switch_is_persisted() {
    let fx = good_fixture();
    let output = fx.run(&["update", "--channel", "beta", "--check", "--json"]);
    assert_eq!(code(&output), 10, "{}", stderr(&output));
    let config = fs::read_to_string(fx.config.path().join("config.toml")).unwrap();
    assert!(config.contains("channel = \"beta\""), "{config}");
}

#[test]
fn unmanaged_install_is_detected() {
    let fx = good_fixture();
    let mut cmd = Command::new(BIN);
    cmd.env_clear()
        .env("PATH", std::env::var_os("PATH").unwrap_or_default())
        .env("HOME", fx._home.path())
        .env("DUYET_CONFIG_DIR", fx.config.path())
        .env("DUYET_CACHE_DIR", fx._cache.path())
        .env("DUYET_CLI_BASE_URL", &fx.base)
        .env("DUYET_MINISIGN_PUB", &fx.pubkey)
        .env("DUYET_NO_UPDATE_CHECK", "1")
        .args(["update", "--json"]);
    let output = cmd.output().unwrap();
    assert_eq!(output.status.code().unwrap(), 1, "{}", stderr(&output));
    let value: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert_eq!(value["error"]["code"], "unmanaged_install");
}

#[test]
fn background_check_throttled_to_once_per_day() {
    let dir = tempfile::tempdir().unwrap();
    let stamp = dir.path().join("update-check");
    assert!(duyet::update::due_for_check(&stamp));
    fs::write(&stamp, "9999999999").unwrap();
    assert!(!duyet::update::due_for_check(&stamp));
}

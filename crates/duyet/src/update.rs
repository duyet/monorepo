use std::fs::{self, File};
use std::io::{self, Cursor, IsTerminal, Read};
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use minisign_verify::{PublicKey, Signature};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use url::Url;

use crate::cli::{Command, Ctx, env_switch};
use crate::config::{Channel, ConfigKey, Value};
use crate::domain::{
    ReleaseAsset, ReleaseManifest, UpdateApplied, UpdateCheck, UpdateRollback,
};
use crate::error::CliError;
use crate::http::Http;
use crate::output::Mode;
use crate::{TARGET, VERSION};

const DEFAULT_CLI_BASE: &str = "https://duyet.net/cli";
const EMBEDDED_PUBKEY: &str = crate::MINISIGN_PUB;
const CHECK_STAMP: &str = "update-check";
const CHECK_INTERVAL: Duration = Duration::from_secs(24 * 60 * 60);
const BACKGROUND_TIMEOUT: Duration = Duration::from_secs(1);

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct VersionsFile {
    pub current: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub previous: Option<String>,
    pub channel: Channel,
    pub installed_at: String,
}

pub fn run(args: &crate::cli::update::Args, ctx: &Ctx) -> Result<(), CliError> {
    if args.rollback {
        return rollback(ctx);
    }
    let channel = args.channel.unwrap_or_else(|| ctx.settings.channel());
    if args.channel.is_some() {
        persist_channel(ctx, channel)?;
    }
    let http = Http::new(&ctx.paths, &ctx.globals, &ctx.settings)?;
    let manifest = fetch_manifest(&http, channel)?;
    let latest = args
        .version
        .clone()
        .unwrap_or_else(|| manifest.version.clone());
    let available = version_newer(&latest, VERSION);

    if args.check {
        let report = UpdateCheck {
            current: VERSION.to_owned(),
            latest: latest.clone(),
            channel,
            update_available: available,
        };
        ctx.emit(&report)?;
        return if available {
            Err(CliError::UpdateAvailable)
        } else {
            Ok(())
        };
    }

    if !available && args.version.is_none() {
        ctx.emit(&UpdateCheck {
            current: VERSION.to_owned(),
            latest,
            channel,
            update_available: false,
        })?;
        return Ok(());
    }

    let exe = current_exe()?;
    if !is_managed_install(&exe) {
        return Err(CliError::UnmanagedInstall { path: exe });
    }
    let install_dir = exe
        .parent()
        .ok_or_else(|| CliError::Internal("binary has no parent directory".into()))?
        .to_path_buf();
    let asset = asset_for(&manifest, TARGET)?;
    apply_release(&http, &install_dir, &asset, &latest, channel, ctx)?;
    let from_channel = ctx.settings.channel();
    let downgraded = from_channel == Channel::Beta && channel == Channel::Stable;
    ctx.emit(&UpdateApplied {
        from: VERSION.to_owned(),
        to: latest,
        channel,
        previous_kept: true,
        downgraded,
    })
}

pub fn maybe_background_check(command: &Command, ctx: &Ctx) {
    if matches!(command, Command::Update(_)) {
        return;
    }
    if ctx.mode == Mode::Json || ctx.globals.quiet {
        return;
    }
    if !ctx.settings.update_check() || env_switch("DUYET_NO_UPDATE_CHECK") {
        return;
    }
    if !std::io::stderr().is_terminal() {
        return;
    }
    if ctx.globals.offline {
        return;
    }
    let stamp = ctx.paths.cache_dir.join(CHECK_STAMP);
    if !due_for_check(&stamp) {
        return;
    }
    let _ = fs::create_dir_all(&ctx.paths.cache_dir);
    let _ = fs::write(&stamp, unix_now().to_string());
    let Ok(http) = Http::new(&ctx.paths, &ctx.globals, &ctx.settings) else {
        return;
    };
    let channel = ctx.settings.channel();
    let Ok(url) = manifest_url(channel) else {
        return;
    };
    let Ok(body) = http.get_text_once(&url, BACKGROUND_TIMEOUT) else {
        return;
    };
    let Ok(manifest) = parse_manifest(&body) else {
        return;
    };
    if version_newer(&manifest.version, VERSION) {
        eprintln!(
            "duyet {} available ({}). Run duyet update.",
            manifest.version, channel
        );
    }
}

pub fn due_for_check(stamp: &Path) -> bool {
    let Ok(text) = fs::read_to_string(stamp) else {
        return true;
    };
    let Ok(then) = text.trim().parse::<u64>() else {
        return true;
    };
    unix_now().saturating_sub(then) >= CHECK_INTERVAL.as_secs()
}

pub fn is_managed_install(exe: &Path) -> bool {
    let Some(parent) = exe.parent() else {
        return false;
    };
    managed_bin_dirs()
        .iter()
        .any(|dir| same_dir(parent, dir))
}

pub fn managed_bin_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Some(dir) = std::env::var_os("DUYET_INSTALL_DIR") {
        dirs.push(PathBuf::from(dir));
    }
    if let Some(home) = home_dir() {
        dirs.push(home.join(".duyet").join("bin"));
    }
    if cfg!(windows)
        && let Some(local) = std::env::var_os("LOCALAPPDATA")
    {
        dirs.push(PathBuf::from(local).join("duyet").join("bin"));
    }
    dirs
}

pub fn parse_manifest(text: &str) -> Result<ReleaseManifest, CliError> {
    serde_json::from_str(text).map_err(|err| CliError::Internal(format!("manifest: {err}")))
}

pub fn parse_sha256sums(text: &str, filename: &str) -> Result<String, CliError> {
    let base = Path::new(filename)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or(filename);
    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let (hash, name) = line
            .split_once("  ")
            .or_else(|| line.split_once(" *"))
            .or_else(|| line.split_once('\t'))
            .ok_or_else(|| CliError::Internal("malformed SHA256SUMS line".into()))?;
        let name = Path::new(name.trim())
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or(name.trim());
        if name == base {
            return Ok(hash.trim().to_ascii_lowercase());
        }
    }
    Err(CliError::Internal(format!(
        "SHA256SUMS has no entry for {base}"
    )))
}

pub fn sha256_hex(bytes: &[u8]) -> String {
    let digest = Sha256::digest(bytes);
    digest.iter().map(|b| format!("{b:02x}")).collect()
}

pub fn verify_minisign(data: &[u8], sig_text: &str, pubkey_text: &str) -> Result<(), CliError> {
    let line = pubkey_text
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty() && !line.starts_with("untrusted"))
        .unwrap_or(pubkey_text.trim());
    let pk = PublicKey::from_base64(line).map_err(|_| CliError::BadSignature)?;
    let signature = Signature::decode(sig_text).map_err(|_| CliError::BadSignature)?;
    pk.verify(data, &signature, false)
        .map_err(|_| CliError::BadSignature)
}

pub fn public_key_text() -> String {
    std::env::var("DUYET_MINISIGN_PUB").unwrap_or_else(|_| EMBEDDED_PUBKEY.to_owned())
}

pub fn version_newer(latest: &str, current: &str) -> bool {
    match (parse_parts(latest), parse_parts(current)) {
        (Some(a), Some(b)) => a > b,
        _ => latest != current,
    }
}

fn parse_parts(raw: &str) -> Option<(u64, u64, u64, u64)> {
    let raw = raw.trim().trim_start_matches('v');
    let (main, pre) = match raw.split_once('-') {
        Some((main, pre)) => (main, Some(pre)),
        None => (raw, None),
    };
    let mut nums = main.split('.');
    let major = nums.next()?.parse().ok()?;
    let minor = nums.next()?.parse().ok()?;
    let patch = nums.next()?.parse().ok()?;
    let pre_n = match pre {
        None => u64::MAX,
        Some(pre) => {
            let digits: String = pre.chars().filter(|c| c.is_ascii_digit()).collect();
            digits.parse().unwrap_or(0)
        }
    };
    Some((major, minor, patch, pre_n))
}

fn fetch_manifest(http: &Http, channel: Channel) -> Result<ReleaseManifest, CliError> {
    let url = manifest_url(channel)?;
    let fetched = http.get(&url)?;
    parse_manifest(&fetched.body)
}

fn manifest_url(channel: Channel) -> Result<Url, CliError> {
    let base = std::env::var("DUYET_CLI_BASE_URL").unwrap_or_else(|_| DEFAULT_CLI_BASE.to_owned());
    let base = base.trim_end_matches('/');
    Url::parse(&format!("{base}/{channel}.json")).map_err(|err| {
        CliError::Internal(format!("DUYET_CLI_BASE_URL: {err}"))
    })
}

fn asset_for<'a>(manifest: &'a ReleaseManifest, target: &str) -> Result<&'a ReleaseAsset, CliError> {
    manifest.targets.get(target).ok_or_else(|| CliError::Internal(format!(
        "channel manifest has no asset for {target}"
    )))
}

fn apply_release(
    http: &Http,
    install_dir: &Path,
    asset: &ReleaseAsset,
    version: &str,
    channel: Channel,
    ctx: &Ctx,
) -> Result<(), CliError> {
    let archive_url = Url::parse(&asset.url).map_err(|err| CliError::Internal(err.to_string()))?;
    let sums_url = sibling(&archive_url, "SHA256SUMS")?;
    let sig_url = sibling(&archive_url, "SHA256SUMS.minisig")?;
    let archive = http.get_bytes(&archive_url)?;
    let sums = http.get_bytes(&sums_url)?;
    let sig = http.get_bytes(&sig_url)?;
    verify_minisign(&sums, &String::from_utf8_lossy(&sig), &public_key_text())?;
    let name = archive_url
        .path_segments()
        .and_then(|s| s.last())
        .unwrap_or("archive");
    let expected = parse_sha256sums(&String::from_utf8_lossy(&sums), name)?;
    let actual = sha256_hex(&archive);
    if actual != expected {
        return Err(CliError::ChecksumMismatch { expected, actual });
    }
    if let Some(listed) = asset.sha256.as_ref() {
        let listed = listed.to_ascii_lowercase();
        if listed != actual {
            return Err(CliError::ChecksumMismatch {
                expected: listed,
                actual,
            });
        }
    }
    if ctx.globals.dry_run {
        return Ok(());
    }
    let staging = install_dir.join("staging");
    fs::create_dir_all(&staging).map_err(|source| CliError::Io {
        path: staging.clone(),
        source,
    })?;
    let archive_path = staging.join(name);
    fs::write(&archive_path, &archive).map_err(|source| CliError::Io {
        path: archive_path.clone(),
        source,
    })?;
    let unpacked = unpack_archive(&archive, name, &staging)?;
    swap_binaries(install_dir, &unpacked)?;
    let _ = fs::remove_dir_all(&staging);
    write_versions(install_dir, version, VERSION, channel)?;
    Ok(())
}

fn sibling(url: &Url, name: &str) -> Result<Url, CliError> {
    let mut next = url.clone();
    {
        let mut segs = next
            .path_segments_mut()
            .map_err(|_| CliError::Internal("archive URL cannot be a base".into()))?;
        segs.pop();
        segs.push(name);
    }
    Ok(next)
}

pub fn unpack_archive(bytes: &[u8], name: &str, dest: &Path) -> Result<PathBuf, CliError> {
    let lower = name.to_ascii_lowercase();
    if lower.ends_with(".zip") {
        unpack_zip(bytes, dest)
    } else if lower.ends_with(".tar.xz") || lower.ends_with(".txz") {
        let mut decoded = Vec::new();
        lzma_rs::xz_decompress(&mut Cursor::new(bytes), &mut decoded)
            .map_err(|err| CliError::Internal(format!("xz: {err}")))?;
        unpack_tar(&decoded, dest)
    } else if lower.ends_with(".tar.gz") || lower.ends_with(".tgz") {
        let decoder = flate2::read::GzDecoder::new(Cursor::new(bytes));
        unpack_tar_reader(decoder, dest)
    } else if lower.ends_with(".tar") {
        unpack_tar(bytes, dest)
    } else {
        Err(CliError::Internal(format!("unsupported archive {name}")))
    }
}

fn unpack_tar(bytes: &[u8], dest: &Path) -> Result<PathBuf, CliError> {
    unpack_tar_reader(Cursor::new(bytes), dest)
}

fn unpack_tar_reader<R: Read>(reader: R, dest: &Path) -> Result<PathBuf, CliError> {
    let mut archive = tar::Archive::new(reader);
    archive.unpack(dest).map_err(|source| CliError::Io {
        path: dest.to_path_buf(),
        source,
    })?;
    find_binary(dest)
}

fn unpack_zip(bytes: &[u8], dest: &Path) -> Result<PathBuf, CliError> {
    let mut archive = zip::ZipArchive::new(Cursor::new(bytes))
        .map_err(|err| CliError::Internal(format!("zip: {err}")))?;
    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|err| CliError::Internal(format!("zip: {err}")))?;
        let out = dest.join(file.name());
        if file.is_dir() {
            fs::create_dir_all(&out).map_err(|source| CliError::Io {
                path: out,
                source,
            })?;
            continue;
        }
        if let Some(parent) = out.parent() {
            fs::create_dir_all(parent).map_err(|source| CliError::Io {
                path: parent.to_path_buf(),
                source,
            })?;
        }
        let mut dest_file = File::create(&out).map_err(|source| CliError::Io {
            path: out.clone(),
            source,
        })?;
        io::copy(&mut file, &mut dest_file).map_err(|source| CliError::Io {
            path: out,
            source,
        })?;
    }
    find_binary(dest)
}

fn find_binary(dest: &Path) -> Result<PathBuf, CliError> {
    let want = if cfg!(windows) { "duyet.exe" } else { "duyet" };
    fn walk(dir: &Path, want: &str) -> Option<PathBuf> {
        let entries = fs::read_dir(dir).ok()?;
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                if let Some(found) = walk(&path, want) {
                    return Some(found);
                }
            } else if path.file_name().and_then(|n| n.to_str()) == Some(want) {
                return Some(path);
            }
        }
        None
    }
    walk(dest, want).ok_or_else(|| CliError::Internal("archive has no duyet binary".into()))
}

pub fn binary_names() -> (&'static str, &'static str) {
    if cfg!(windows) {
        ("duyet.exe", "duyet.prev.exe")
    } else {
        ("duyet", "duyet.prev")
    }
}

pub fn swap_binaries(install_dir: &Path, new_bin: &Path) -> Result<(), CliError> {
    let (current_name, prev_name) = binary_names();
    let current = install_dir.join(current_name);
    let prev = install_dir.join(prev_name);
    #[cfg(windows)]
    {
        let stale = install_dir.join("duyet.prev.old.exe");
        let _ = fs::remove_file(&stale);
        if prev.exists() && fs::remove_file(&prev).is_err() {
            let _ = fs::rename(&prev, &stale);
        }
    }
    #[cfg(not(windows))]
    {
        let _ = fs::remove_file(&prev);
    }
    if current.exists() {
        fs::rename(&current, &prev).map_err(|source| CliError::Io {
            path: prev.clone(),
            source,
        })?;
    }
    fs::rename(new_bin, &current).or_else(|_| {
        fs::copy(new_bin, &current).map(|_| ()).map_err(|source| CliError::Io {
            path: current.clone(),
            source,
        })
    })?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&current)
            .map_err(|source| CliError::Io {
                path: current.clone(),
                source,
            })?
            .permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&current, perms).map_err(|source| CliError::Io {
            path: current,
            source,
        })?;
    }
    Ok(())
}

pub fn rollback_swap(install_dir: &Path) -> Result<bool, CliError> {
    let (current_name, prev_name) = binary_names();
    let current = install_dir.join(current_name);
    let prev = install_dir.join(prev_name);
    if !prev.exists() {
        return Ok(false);
    }
    let tmp = install_dir.join(format!("{current_name}.rollback-tmp"));
    if current.exists() {
        fs::rename(&current, &tmp).map_err(|source| CliError::Io {
            path: tmp.clone(),
            source,
        })?;
    }
    fs::rename(&prev, &current).map_err(|source| {
        if tmp.exists() {
            let _ = fs::rename(&tmp, &current);
        }
        CliError::Io {
            path: current.clone(),
            source,
        }
    })?;
    if tmp.exists() {
        let _ = fs::rename(&tmp, &prev);
        let _ = fs::remove_file(&prev);
    }
    Ok(true)
}

fn rollback(ctx: &Ctx) -> Result<(), CliError> {
    let exe = current_exe()?;
    if !is_managed_install(&exe) {
        return Err(CliError::UnmanagedInstall { path: exe });
    }
    let install_dir = exe.parent().unwrap();
    let restored = rollback_swap(install_dir)?;
    if restored {
        let versions_path = install_dir.join("versions.json");
        if let Ok(text) = fs::read_to_string(&versions_path)
            && let Ok(mut file) = serde_json::from_str::<VersionsFile>(&text)
        {
            let restored_ver = file.previous.clone();
            file.previous = Some(file.current.clone());
            if let Some(prev) = restored_ver.clone() {
                file.current = prev;
            }
            file.installed_at = iso_now();
            let _ = fs::write(
                &versions_path,
                serde_json::to_string_pretty(&file).unwrap_or_default(),
            );
            return ctx.emit(&UpdateRollback {
                restored: true,
                version: restored_ver,
            });
        }
    }
    ctx.emit(&UpdateRollback {
        restored,
        version: None,
    })
}

fn write_versions(
    install_dir: &Path,
    current: &str,
    previous: &str,
    channel: Channel,
) -> Result<(), CliError> {
    let file = VersionsFile {
        current: current.to_owned(),
        previous: Some(previous.to_owned()),
        channel,
        installed_at: iso_now(),
    };
    let path = install_dir.join("versions.json");
    let text = serde_json::to_string_pretty(&file)
        .map_err(|err| CliError::Internal(err.to_string()))?;
    fs::write(&path, text).map_err(|source| CliError::Io { path, source })
}

fn persist_channel(ctx: &Ctx, channel: Channel) -> Result<(), CliError> {
    if ctx.globals.dry_run {
        return Ok(());
    }
    let mut file = ctx.config.file().cloned().unwrap_or_default();
    file.set(ConfigKey::Channel, &Value::Channel(channel));
    file.save(&ctx.paths.config_file, false)?;
    Ok(())
}

fn current_exe() -> Result<PathBuf, CliError> {
    if let Some(path) = std::env::var_os("DUYET_CURRENT_EXE") {
        return Ok(PathBuf::from(path));
    }
    std::env::current_exe().map_err(|source| CliError::Io {
        path: PathBuf::from("<current_exe>"),
        source,
    })
}

fn home_dir() -> Option<PathBuf> {
    std::env::var_os("HOME")
        .or_else(|| std::env::var_os("USERPROFILE"))
        .map(PathBuf::from)
}

fn same_dir(a: &Path, b: &Path) -> bool {
    match (fs::canonicalize(a), fs::canonicalize(b)) {
        (Ok(a), Ok(b)) => a == b,
        _ => a == b,
    }
}

fn unix_now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

fn iso_now() -> String {
    let secs = unix_now();
    format!("{secs}")
}

#[cfg(windows)]
pub fn cleanup_stale_prev() {
    if let Ok(exe) = std::env::current_exe()
        && let Some(dir) = exe.parent()
    {
        let _ = fs::remove_file(dir.join("duyet.prev.old.exe"));
    }
}

#[cfg(not(windows))]
pub fn cleanup_stale_prev() {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_order_treats_beta_as_older() {
        assert!(version_newer("0.2.0", "0.1.0"));
        assert!(!version_newer("0.1.0", "0.1.0"));
        assert!(version_newer("0.1.0", "0.1.0-beta.1"));
        assert!(!version_newer("0.1.0-beta.1", "0.1.0"));
    }

    #[test]
    fn sha256sums_matches_basename() {
        let text = "abc  duyet-x86_64-unknown-linux-musl.tar.gz\n";
        assert_eq!(
            parse_sha256sums(text, "https://x/duyet-x86_64-unknown-linux-musl.tar.gz").unwrap(),
            "abc"
        );
    }

    #[test]
    fn throttle_uses_stamp_age() {
        let dir = tempfile::tempdir().unwrap();
        let stamp = dir.path().join("stamp");
        assert!(due_for_check(&stamp));
        fs::write(&stamp, unix_now().to_string()).unwrap();
        assert!(!due_for_check(&stamp));
        fs::write(&stamp, "1").unwrap();
        assert!(due_for_check(&stamp));
    }

    #[test]
    fn unmanaged_path_is_rejected() {
        assert!(!is_managed_install(Path::new("/usr/bin/duyet")));
    }

    #[test]
    fn rollback_without_prev_is_noop() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("duyet"), b"cur").unwrap();
        assert!(!rollback_swap(dir.path()).unwrap());
        assert_eq!(fs::read(dir.path().join("duyet")).unwrap(), b"cur");
    }

    #[test]
    fn swap_and_rollback_round_trip() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("duyet"), b"old").unwrap();
        let new = dir.path().join("new");
        fs::write(&new, b"fresh").unwrap();
        swap_binaries(dir.path(), &new).unwrap();
        assert_eq!(fs::read(dir.path().join("duyet")).unwrap(), b"fresh");
        assert_eq!(fs::read(dir.path().join("duyet.prev")).unwrap(), b"old");
        assert!(rollback_swap(dir.path()).unwrap());
        assert_eq!(fs::read(dir.path().join("duyet")).unwrap(), b"old");
        assert!(!rollback_swap(dir.path()).unwrap());
    }

    #[test]
    fn manifest_parses_channel_shape() {
        let json = r#"{
            "version":"0.2.0",
            "tag":"duyet-v0.2.0",
            "published_at":"2026-01-01T00:00:00Z",
            "targets":{
                "x86_64-unknown-linux-musl":{
                    "url":"http://127.0.0.1/duyet.tar.gz",
                    "sha256":"abc",
                    "size":12
                }
            }
        }"#;
        let m = parse_manifest(json).unwrap();
        assert_eq!(m.version, "0.2.0");
        assert_eq!(m.targets.len(), 1);
    }
}

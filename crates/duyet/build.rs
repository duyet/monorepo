use std::env;
use std::process::Command;

fn main() {
    println!("cargo:rerun-if-env-changed=DUYET_COMMIT");
    println!("cargo:rerun-if-changed=../../.git/HEAD");
    println!(
        "cargo:rustc-env=DUYET_TARGET={}",
        env::var("TARGET").unwrap_or_else(|_| "unknown".into())
    );
    println!("cargo:rustc-env=DUYET_COMMIT={}", commit());
}

fn commit() -> String {
    let from_git = Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .output()
        .ok()
        .filter(|output| output.status.success())
        .and_then(|output| String::from_utf8(output.stdout).ok())
        .map(|text| text.trim().to_owned())
        .filter(|text| !text.is_empty());
    from_git
        .or_else(|| {
            env::var("DUYET_COMMIT")
                .ok()
                .filter(|text| !text.is_empty())
        })
        .unwrap_or_else(|| "unknown".into())
}

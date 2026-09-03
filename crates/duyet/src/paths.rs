use std::path::{Path, PathBuf};

use directories::BaseDirs;

use crate::error::CliError;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Paths {
    pub config_file: PathBuf,
    pub cache_dir: PathBuf,
    pub data_dir: PathBuf,
}

impl Paths {
    /// `--config PATH` wins for the file; `DUYET_CONFIG_DIR`, `DUYET_CACHE_DIR`, `DUYET_DATA_DIR`
    /// override the per-OS defaults from `directories`.
    pub fn resolve(config_flag: Option<&Path>) -> Result<Paths, CliError> {
        let env_dir = |name: &str| std::env::var_os(name).map(PathBuf::from);
        let base = BaseDirs::new();
        let base_dir = |pick: fn(&BaseDirs) -> &Path, suffix: &str| -> Result<PathBuf, CliError> {
            let dirs = base
                .as_ref()
                .ok_or_else(|| CliError::Internal("cannot determine the home directory".into()))?;
            let mut dir = pick(dirs).join("duyet");
            if !suffix.is_empty() {
                dir.push(suffix);
            }
            Ok(dir)
        };

        let config_file = match (config_flag, env_dir("DUYET_CONFIG_DIR")) {
            (Some(path), _) => path.to_path_buf(),
            (None, Some(dir)) => dir.join("config.toml"),
            (None, None) => base_dir(BaseDirs::config_dir, "config.toml")?,
        };
        let cache_dir = match env_dir("DUYET_CACHE_DIR") {
            Some(dir) => dir,
            None => base_dir(
                BaseDirs::cache_dir,
                if cfg!(windows) { "cache" } else { "" },
            )?,
        };
        let data_dir = match env_dir("DUYET_DATA_DIR") {
            Some(dir) => dir,
            None => base_dir(BaseDirs::data_dir, if cfg!(windows) { "data" } else { "" })?,
        };
        Ok(Paths {
            config_file,
            cache_dir,
            data_dir,
        })
    }
}

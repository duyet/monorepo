# `duyet`

One binary for readers, recruiters, and agents. It reads blog posts, notes, series, KB articles,
and news from duyet.net, talks to the duyet agent, and submits contact messages, job
descriptions, and comments after an explicit confirm. Every command has `--json` output and a
long `--help` with examples and the JSON shape it returns.

This crate is the user-facing CLI from epic [#1440](https://github.com/duyet/monorepo/issues/1440).
It is not `duyet-cli` (`crates/cli`), the build-time JSON stdin/stdout tool used by
`@duyet/libs/native-cli`; that binary is unchanged.

```sh
cargo run -p duyet -- --help
cargo run -p duyet -- version --json | jq .data.version
cargo run -p duyet -- doctor
```

The full command reference is generated from the clap tree into [`docs/reference.md`](docs/reference.md)
by `duyet docs markdown`; `cargo test -p duyet` fails when it is stale and
`UPDATE_GOLDEN=1 cargo test -p duyet` rewrites it together with `tests/golden/*.txt`.

## What works in this release (P1)

`version`, `config path|show|set|unset|doctor`, `doctor`, `completions`, `docs man|markdown|tree`.

Every other command is present in the tree with full arguments and `--help`, and exits 2 with
`not implemented yet, tracked in #<issue>` (JSON: `code: "not_implemented"`, `tracking: <issue URL>`):

| Commands | Tracked in |
|---|---|
| `posts`, `notes`, `series`, `kb`, `news`, `images`, `insights` | [#1443](https://github.com/duyet/monorepo/issues/1443) |
| `chat`, `auth` | [#1445](https://github.com/duyet/monorepo/issues/1445) |
| `update` | [#1447](https://github.com/duyet/monorepo/issues/1447) |
| `contact`, `jd`, `comment` | [#1448](https://github.com/duyet/monorepo/issues/1448) |

Release pipeline and installers are [#1444](https://github.com/duyet/monorepo/issues/1444) and
[#1446](https://github.com/duyet/monorepo/issues/1446).

## Output contract

stdout carries data. stderr carries progress, `-v` logs, and human-readable errors. Progress
indicators (none yet) go to stderr and only when stderr is a TTY.

Human output is the default. `--json` (or `DUYET_OUTPUT=json`, or `output = "json"` in the config)
prints exactly one envelope on stdout with a trailing newline:

```json
{"ok":true,"schema":"duyet.version.v1","data":{"version":"0.1.0","target":"x86_64-unknown-linux-musl","channel":"stable","commit":"abc1234"}}
{"ok":false,"schema":"duyet.error.v1","error":{"code":"not_implemented","message":"not implemented yet, tracked in #1443","remediation":"follow https://github.com/duyet/monorepo/issues/1443","exit_code":2,"tracking":"https://github.com/duyet/monorepo/issues/1443"}}
```

`ok`, `data`, and `error` are the same keys `duyet-cli` uses; `schema` is new. Errors also carry
`request_id` when the server sent `x-request-id` or `cf-ray`. Optional fields are omitted, never
`null`. A clap usage error with `--json` on the command line is also an envelope
(`code: "usage"`); without `--json` it is clap's own text on stderr.

`-q/--quiet` silences human output only. JSON is data and is always printed.

Streaming commands (`chat`, long lists in later slices) print NDJSON in JSON mode: one
`{"schema":"duyet.<name>.v1","data":{...}}` object per line, no envelope, so `| jq -c` works on
each line as it arrives.

`completions`, `docs markdown`, and `docs tree` print raw text regardless of `--json`.

### Deterministic ordering

Every list is sorted by a documented key before rendering. JSON object keys come from structs or
`BTreeMap`, never `HashMap`, so two runs over the same data produce byte-identical output.

### Compatibility policy

Schemas are versioned by suffix (`duyet.config.v1`). Within a major, fields are only added. A
rename or removal bumps the suffix (`.v2`) and the old schema keeps working for one minor release
cycle. Consumers should select on `schema`, not on the command they ran.

## Exit codes

| Code | Meaning | Error codes |
|---|---|---|
| 0 | success | |
| 1 | generic failure | `internal`, `io`, `config_invalid` (from `config doctor`) |
| 2 | usage error or not implemented | `usage`, `not_implemented`, `config_unknown_key`, `config_invalid_value` |
| 3 | network or HTTP failure | `network`, `offline`, `http_<status>` |
| 4 | authentication required or rejected | (P8) |
| 5 | confirmation declined or unavailable | `declined` |
| 6 | resource not found | `http_404` |
| 10 | update available (`update --check`) | (P5) |

`doctor` exits 0 whenever it could produce a report, even if every endpoint is unreachable.

## Configuration

`duyet config show` prints every key with its effective value and where it came from.
Precedence, highest first: **flag** (`--json`) > **environment** (`DUYET_<KEY>`) > **config file**
> **built-in default**.

| Key | Env | Kind | Default |
|---|---|---|---|
| `blog_url` | `DUYET_BLOG_URL` | http(s) URL | `https://blog.duyet.net` |
| `kb_url` | `DUYET_KB_URL` | http(s) URL | `https://kb.duyet.net` |
| `api_url` | `DUYET_API_URL` | http(s) URL | `https://api.duyet.net` |
| `agents_api_url` | `DUYET_AGENTS_API_URL` | http(s) URL | `https://agents-api.duyet.net` |
| `news_url` | `DUYET_NEWS_URL` | http(s) URL | `https://news.duyet.net` |
| `channel` | `DUYET_CHANNEL` | `stable` \| `beta` | `stable` |
| `output` | `DUYET_OUTPUT` | `human` \| `json` | `human` |
| `telemetry` | `DUYET_TELEMETRY` | bool | `false` |
| `update.check` | `DUYET_UPDATE_CHECK` | bool | `true` |

Values are validated when set (`config set` exits 2 with `config_invalid_value`) and again when
read from the file or the environment. URLs are normalized (`http://127.0.0.1:1` is stored as
`http://127.0.0.1:1/`).

The file is TOML:

```toml
blog_url = "https://blog.duyet.net"
channel = "stable"
output = "human"
telemetry = false

[update]
check = true
```

`config set` writes atomically: the new content goes to a temp file in the same directory, which is
then renamed over the old one, so a crash never leaves a half-written file. On unix the file is
created with mode 0600. `config unset` on a key that is not set exits 0 and reports
`changed: false`. `--dry-run` prints the TOML that would be written and writes nothing.

`config doctor` lints the file: parse errors, unknown keys, invalid values, secret-looking keys
(names containing `token`, `secret`, `password`, `api_key`), and, on unix, a mode looser than 0600
(a warning). It never echoes values. Any error exits 1 with `config_invalid`. It still runs on a
file that fails to parse; every other command refuses such a file with the parse error.

**The config file never holds a secret.** The agent token lives only in `DUYET_AGENT_TOKEN` in this
release, and in the OS keychain once `auth login` lands (#1445).

Other environment variables: `DUYET_OFFLINE=1` (same as `--offline`), `DUYET_TIMEOUT` (seconds,
same as `--timeout`), `DUYET_CA_BUNDLE` (see below), `DUYET_AGENT_TOKEN`, `NO_COLOR`,
`CLICOLOR_FORCE`, `CI`.

### Directories

| | Linux | macOS | Windows |
|---|---|---|---|
| config | `$XDG_CONFIG_HOME/duyet/config.toml` (`~/.config`) | `~/Library/Application Support/duyet/config.toml` | `%APPDATA%\duyet\config.toml` |
| cache | `$XDG_CACHE_HOME/duyet` (`~/.cache`) | `~/Library/Caches/duyet` | `%LOCALAPPDATA%\duyet\cache` |
| data | `$XDG_DATA_HOME/duyet` (`~/.local/share`) | `~/Library/Application Support/duyet` | `%APPDATA%\duyet\data` |

Overrides: `--config PATH` (the file), `DUYET_CONFIG_DIR`, `DUYET_CACHE_DIR`, `DUYET_DATA_DIR`.
Tests and agents isolate themselves by pointing the last three at temp dirs.

## Terminal behavior

Colors are on only when stdout is a TTY, `NO_COLOR` is unset, `TERM` is not `dumb`, and
`--no-color` is not passed. `CLICOLOR_FORCE` turns them on regardless (except with `--no-color`).
Unicode marks (`✓ ✗`) are used when the locale advertises UTF-8 and `TERM` is not `dumb`; otherwise
ASCII (`ok FAIL`).

Prompts never hang an agent. A command that needs confirmation asks `[y/N]` on a TTY, accepts
`--yes`/`-y` anywhere, and exits 5 (`declined`, remediation "pass --yes") when stdin or stdout is
not a TTY, `CI` is set, or `--no-input` is passed.

## Network

- User agent `duyet/<version> (<channel>; <target>)`.
- TLS via rustls with the `ring` provider; no OpenSSL, so Linux builds are static musl.
  Roots come from the platform verifier (system store on Linux via `rustls-native-certs`,
  Security.framework on macOS, SChannel on Windows). `DUYET_CA_BUNDLE=/path/to/bundle.pem` adds
  extra roots for corporate proxies.
- Proxies from `HTTPS_PROXY`, `HTTP_PROXY`, `NO_PROXY` (reqwest defaults).
- Timeout `--timeout SECS` / `DUYET_TIMEOUT`, default 30. `doctor` probes use `min(5s, timeout)`.
- Retries: three attempts with 200 ms, 400 ms backoff on connect errors, timeouts, and 5xx. Never on
  4xx. Retried GETs are idempotent by construction.
- Disk cache under `<cache>/http/`, keyed by `sha256(url)`, honoring `ETag` (`If-None-Match`) and
  `Cache-Control: max-age`. A fresh entry is served without a request; a stale one is revalidated
  and a 304 refreshes it.
- `--offline` / `DUYET_OFFLINE=1`: serve from cache or fail with exit 3 (`offline`); `doctor`
  reports every probe as `skipped (offline)` and exits 0.
- `-v` logs one stderr line per request (`duyet: GET <url> -> <status> <ms>ms`); `-vv` adds cache
  decisions and the resolved config, cache, and data paths.
- Request ids (`x-request-id`, then `cf-ray`) are kept on HTTP and network errors.

## Redaction

The value of `DUYET_AGENT_TOKEN`, and any `Bearer <token>` credential, is replaced with
`[redacted]` in every error message, remediation, `-v` log line, and probe message. `doctor`
reports the token as `set` or `unset` through a type that never holds the value.

## Signals, atomic writes, idempotency

Ctrl-C (SIGINT) ends the process with the default handler; nothing in P1 holds partial state, and
every file write (config, cache entries) is temp-file-plus-rename, so an interrupted write leaves
the previous content intact. A reader that hangs up (`duyet docs tree | head`) is not an error:
stdout writes that hit `EPIPE` stop quietly and the process exits 0 with nothing on stderr.
`config set` and `config unset` converge: running either twice yields
the same file. Later mutating commands (`contact`, `jd`, `comment`) send an idempotency key so a
retry never double-posts.

## Telemetry

`telemetry` is an opt-in key and defaults to `false`. Nothing is sent in this release regardless
of its value; `doctor` prints the current setting so the statement is checkable.

## Development

```sh
cargo test -p duyet
cargo clippy -p duyet --all-targets -- -D warnings
cargo fmt -p duyet -- --check
cargo build -p duyet --release --target x86_64-unknown-linux-musl
```

Integration tests run the built binary with `DUYET_CONFIG_DIR`/`DUYET_CACHE_DIR` pointed at temp
dirs and spin a local `TcpListener` for the HTTP cache and retry cases; nothing touches the
network. `build.rs` embeds the target triple and the short git commit (`DUYET_COMMIT` overrides it
for builds without `.git`).

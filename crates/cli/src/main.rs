mod csv_cmd;
mod dedup_cmd;
mod markdown_cmd;
mod normalize_cmd;

use clap::Parser;

#[derive(Parser)]
#[command(name = "duyet-cli", about = "CLI wrapper for Rust data-processing crates")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(clap::Subcommand)]
enum Commands {
    /// Parse CSV text to JSON 2D array
    Csv,
    /// Run normalizer functions on batched inputs
    Normalize,
    /// Merge and deduplicate model sources
    Dedup,
    /// Convert markdown to HTML
    Markdown,
}

fn main() {
    let cli = Cli::parse();

    let result = match cli.command {
        Commands::Csv => csv_cmd::run(),
        Commands::Normalize => normalize_cmd::run(),
        Commands::Dedup => dedup_cmd::run(),
        Commands::Markdown => markdown_cmd::run(),
    };

    if let Err(e) = result {
        eprintln!(
            "{}",
            serde_json::to_string(&serde_json::json!({"ok": false, "error": e}))
                .unwrap_or_else(|_| r#"{"ok":false,"error":"serialization failed"}"#.to_string())
        );
        std::process::exit(1);
    }
}

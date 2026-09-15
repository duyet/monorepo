fn main() {
    duyet::update::cleanup_stale_prev();
    let code = duyet::run(std::env::args_os());
    std::process::exit(code as i32);
}

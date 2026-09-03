fn main() {
    let code = duyet::run(std::env::args_os());
    std::process::exit(code as i32);
}

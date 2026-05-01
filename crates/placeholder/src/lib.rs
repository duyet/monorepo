use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn noop() -> String {
    "wasm-infrastructure-ready".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_noop() {
        assert_eq!(noop(), "wasm-infrastructure-ready");
    }
}

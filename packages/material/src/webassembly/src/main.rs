use wasm_bindgen::prelude::*;
use serde_wasm_bindgen;

// create types manually here. wasm-pack doesnt generate them!
#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str  = r#"
export function func(string:string): string
"#;

pub fn main()->(){
    return ()
}

// apply js_name to set the function name in js
// skip_typescript (we type the types manually)
// Return statement should always be JsValue
#[wasm_bindgen(js_name=func,skip_typescript)]
pub fn func(string:&str)->JsValue{
    return serde_wasm_bindgen::to_value(&string).unwrap();
}

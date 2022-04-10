use wasm_bindgen::prelude::*;
static SAMPLING_RATE: i32 = 44100;
mod utils;
extern crate rand;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, this is rust speaking.");
}

#[wasm_bindgen]
pub struct PolyManager {
    max_voices: usize,
    last_stolen_voice: usize,
}
#[wasm_bindgen]
impl PolyManager {
    pub fn new() -> PolyManager {
        log("Rust: new PolyManager");
        utils::set_panic_hook();

        let ret = PolyManager {
            max_voices: 32,
            last_stolen_voice: 0,
        };

        ret
    }
    pub fn trig(&mut self, freq: f32, amp: f32) {
        // does a thing
    }
    pub fn get_dummy_block(self, block_size: usize) -> Vec<f32> {
        let mut mix = Vec::new();
        for sample_n in 0..block_size {
            let f = 220.;
            let sf = SAMPLING_RATE as f32 / f;
            // let rand: f32 = rand::random(); // Also got problems with rand. Left that for later.
            let rand: f32 = ((sample_n as f32 / sf) % 1.) - 0.5; // using sawtooth instead.
            mix.push(rand);
        }
        mix
    }
}

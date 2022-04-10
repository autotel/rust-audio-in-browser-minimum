import "./TextEncoder.js";
import init, { PolyManager } from "./pkg/rrr.js";

// this file is strategically placed here, 
// the rust compiled files together with this file will be copied with 
// no modifications into dist. Therefore the relative paths need to be
// the same.

// mechanism to prevent spam in the log, if the process fails
// Remove before deploy.
let halted = false;
const halt = () => halted = true;
let countdown = 30;
const devRustErrorHandler = () => {
    if (countdown > 0) {
        console.log("will halt in", countdown);
        countdown--;
    } else {
        console.log("halting");
        halt();
    }
}

class MagicWorklet extends AudioWorkletProcessor {
    /** @type {PolyManager|null} */
    rustSynthesizer = null;
    /** @type {Object|null} */
    webAssemblyInstance = null;
    constructor() {
        super();

        console.log("magic-worklet instanced");
        this.samples = [];
        this.totalSamples = 0;


        this.port.onmessage = ({ data: { type, data, wasmBytes } }) => {
            if (halted) return console.log("halted");

            const importObject = {
                env: {},
            };
            
            // loading WASM into a worker is a huge PITA
            // https://github.com/the-drunk-coder/ruffbox/blob/master/js/worklet.js
            // https://steemit.com/eos/@skenan/eos-development-for-beginners-webassembly
            // https://github.com/Ameobea/web-synth/blob/main/public/WaveTableNodeProcessor.js

            if (type === "load-wasm") {
                console.log("worklet: load-wasm received", wasmBytes);
                init(WebAssembly.compile(wasmBytes)).then(() => {
                    console.log({ PolyManager });
                    this.rustSynthesizer = PolyManager.new();
                    // this.rustSynthesizer = new PolyManager();
                    console.log({rustSynthesizer:this.rustSynthesizer});
                    return this.port.postMessage({ type: "wasm-loaded" });
                })
            } else if (type == "trig") {
                if (!this.rustSynthesizer) return console.log("not isntanced");
                console.log("worklet:", data);
                const freq = 55 * Math.pow(2, data.note / 12);
                try {
                    this.rustSynthesizer.trig(freq, 1);
                    console.log("trigger succesful");
                } catch (e) {
                    devRustErrorHandler();
                    console.error(e);
                }
            }
        };
    }



    process(inputs, outputs, parameters) {
        if (!this.rustSynthesizer) {
            console.log("not ready");
            return true;
        }
        if(halted){
            return false;
        }
        const firstOutput = outputs[0];
        /** @type {number} */
        const blockSize = firstOutput[0].length;
        try {
            // const mix = this.rustSynthesizer.get_block(blockSize);
            const mix = this.rustSynthesizer.get_dummy_block(blockSize);
            firstOutput.forEach(
                /**
                 * @param {Float32Array} channel
                 * @param {number} channelN
                 */
                (channel, channelN) => {
                    channel.set(mix)
                }
            )
        } catch (e) {
            devRustErrorHandler();
            console.log("audioblock worklet error", e);
        }

        return true;
    }
}


registerProcessor("magic-worklet", MagicWorklet);
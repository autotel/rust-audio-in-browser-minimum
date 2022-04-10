import audioContextGetter from "./audioContextGetter";

/**
 * @typedef {Object} EventMessage
 * @property {Number} note
 * @property {Number} val
 */

class RustNode extends AudioWorkletNode {
    constructor(audioContext, workletName) {
        // eg. new AudioWorkletNode(audioContext, 'random-noise-processor')
        super(audioContext, workletName);
    }
    /**
     * Initialize the Audio processor by sending the fetched WebAssembly module to
     * the processor worklet.
     *
     * @param {ArrayBuffer} wasmBytes Sequence of bytes representing the entire
     * WASM module that will handle pitch detection.
     * @param {number} numAudioSamplesPerAnalysis Number of audio samples used
     * for each analysis. Must be a power of 2.
     */
    init(wasmBytes, onPitchDetectedCallback, numAudioSamplesPerAnalysis) {
        this.onPitchDetectedCallback = onPitchDetectedCallback;
        this.numAudioSamplesPerAnalysis = numAudioSamplesPerAnalysis;

        // Listen to messages sent from the audio processor.
        this.port.onmessage = (event) => this.onmessage(event.data);

        this.port.postMessage({
            type: "load-wasm",
            wasmBytes,
        });
    }

    // Handle an uncaught exception thrown in the PitchProcessor.
    onprocessorerror = (err) => {
        console.log(
            `An error from AudioWorkletProcessor.process() occurred: ${err}`
        );
    };

    onmessage = (event) => {
        if (event.type === 'wasm-module-loaded') {
            // The Wasm module was successfully sent to the PitchProcessor running on the
            // AudioWorklet thread and compiled. This is our cue to configure the pitch
            // detector.
            this.port.postMessage({
                type: "init-detector",
                sampleRate: this.context.sampleRate,
                numAudioSamplesPerAnalysis: this.numAudioSamplesPerAnalysis
            });
        } else if (event.type === "pitch") {
            // A pitch was detected. Invoke our callback which will result in the UI updating.
            this.onPitchDetectedCallback(event.pitch);
        } else {
            console.log("worklet", event);
        }
    }

    /** @param {EventMessage} event */
    trigger = (event) => {
        this.port.postMessage({
            type: "trig",
            data: event
        });
    }
}
class RustOutput {
    /** @param {EventMessage} event */
    triggerEvent = (event) => {

    };
    constructor() {
        audioContextGetter.get().then(async (audioContext) => {
            console.log("start audio");
            // TODO: run things in parallel. there should be no need to wait load after
            // clicking. It could have already loaded.
            const response = await fetch(`pkg/rrr_bg.wasm?t=${new Date().getTime()}`);
            const wasmBytes = await response.arrayBuffer();
            const processorUrl = `/MagicEngineWorklet.js?t=${new Date().getTime()}`;

            try {
                await audioContext.audioWorklet.addModule(processorUrl);
                console.log("audio worklet module added");
            } catch (e) {
                throw new Error(
                    `Failed to load audio worklet at url: ${processorUrl}. ${e.message}`
                );
            }

            let node = new RustNode(audioContext, "magic-worklet");

            // TODO: two params here are not actually needed.
            node.init(wasmBytes, console.log, 256);
            node.connect(audioContext.destination);

            /** @param {EventMessage} event */
            this.operation = (event) => {
                node.trigger(event);
            }
        });
    };
}

export default RustOutput;
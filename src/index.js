import MagicEngine from "./MagicEngine";

let synth = new MagicEngine();

setInterval(()=>{
    synth.triggerEvent({note:43,val:1});
},100);
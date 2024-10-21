
const { groth16 } = require("snarkjs")
const path = require("path");
const fs = require('fs')
const inputs= {
    "leaf": "0",
    "pathElements": ["0", "0", "0", "0", "0", "0", "0"],
    "pathIndices": ["0", "0", "0", "0", "0", "0", "0"],
    "root" : "001"
  }
  

const wasmPath = path.resolve("src/BE/zk/build/mixer_js/mixer.wasm")
const zkeyPath  = path.resolve("src/BE/zk/build/mixer_js/mixer_0001.zkey")
const wasmBuffer =fs.readFileSync(wasmPath)
const zkeyBuffer =fs.readFileSync(zkeyPath)
const run  = async()=>{
    console.log({zkeyBuffer})
const { proof, publicSignals } = await groth16.fullProve(inputs, wasmBuffer,zkeyBuffer);

console.log(JSON.stringify({ proof, publicSignals }));


}

run()
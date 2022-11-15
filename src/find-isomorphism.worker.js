import ULLMANN_WASM from "./ULLMANN_SIMPLE.wasm";
import VF_WASM from "./VF.wasm";
function loadWasm(fileName) {
  return fetch(fileName).then((response) => {
    return response.arrayBuffer().then((bytes) => {
      return WebAssembly.compile(bytes).then((module) => {
        const memory = new WebAssembly.Memory({
          initial: 65536,
          maximum: 65536,
        });
        const imports = {
          env: {
            abortStackOverflow: () => {
              throw new Error("overflow");
            },
            memoryBase: 0,
            tableBase: 0,
            memory,
            table: new WebAssembly.Table({
              initial: 0,
              maximum: 0,
              element: "anyfunc",
            }),
            STACKTOP: 0,
            STACK_MAX: memory.buffer.byteLength,
          },
        };
        return WebAssembly.instantiate(module, imports || {});
      });
    });
  });
}
export const VF = async (b, a) => {
  console.log("入参");
  console.log("A", JSON.stringify(a));
  console.log("B", JSON.stringify(b));
  const Module = await loadWasm(VF_WASM);
  const { memory } = Module.exports;
  const sqrtA = Math.sqrt(a.length);
  const sqrtB = Math.sqrt(b.length);
  let offset = 0;
  const A = new Int32Array(memory.buffer, offset);
  A.set(a);
  offset += a.length * Int32Array.BYTES_PER_ELEMENT;
  const B = new Int32Array(memory.buffer, offset);
  B.set(b);
  offset += b.length * Int32Array.BYTES_PER_ELEMENT;
  const start = new Date().getTime();
  const r = Module.exports.VF(sqrtA, sqrtB, A.byteOffset, B.byteOffset);
  const end = new Date().getTime();
  const result = new Int32Array(memory.buffer, r);
  console.log(result);
  setTimeout(() => {
    for (let i = 0; i < result[0]; i++) {
      const index = i + 1;
      console.log(`result ${index}`);
      let str = "";
      for (let j = 0; j < sqrtB; j++) {
        str +=
          result[1 + 2 * i * sqrtB + j * 2] +
          " " +
          result[1 + 2 * i * sqrtB + j * 2 + 1] +
          "\n";
      }
      console.log(str);
    }
  }, 1);

  return { result, time: end - start, algorithm: "VF" };
};
export const ULLMANN = async (a, b) => {
  console.log("入参");
  console.log("A", JSON.stringify(a));
  console.log("B", JSON.stringify(b));
  const Module = await loadWasm(ULLMANN_WASM);
  const { memory } = Module.exports;
  const sqrtA = Math.sqrt(a.length);
  const sqrtB = Math.sqrt(b.length);
  let offset = 0;
  const A = new Int32Array(memory.buffer, offset);
  A.set(a);
  offset += a.length * Int32Array.BYTES_PER_ELEMENT;
  const B = new Int32Array(memory.buffer, offset);
  B.set(b);
  offset += b.length * Int32Array.BYTES_PER_ELEMENT;
  const start = new Date().getTime();
  const r = Module.exports.callback(sqrtA, sqrtB, A.byteOffset, B.byteOffset);
  const end = new Date().getTime();
  const result = new Int32Array(memory.buffer, r);
  console.log(result);
  setTimeout(() => {
    for (let i = 0; i < result[0]; i++) {
      const index = i + 1;
      console.log(`result ${index}`);
      let str = "";
      const multiSqrt = sqrtA * sqrtB;
      for (let j = 0; j < multiSqrt; j++) {
        str += result[j + 1 + i * multiSqrt] + " ";
        if ((j + 1) % sqrtB === 0) {
          str += "\n";
        }
      }
      console.log(str);
    }
  }, 1);

  return { result, time: end - start, algorithm: "ULLMANN" };
};

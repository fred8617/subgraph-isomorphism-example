import ULLMANN_WASM from "./ULLMANN.wasm";
import VF_WASM from "./VF.wasm";
import VF2_WASM from "./VF2.wasm";
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
export const VF2 = async (b, a) => {
  console.log("入参");
  console.log("A", JSON.stringify(a));
  console.log("B", JSON.stringify(b));
  const Module = await loadWasm(VF2_WASM);
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
  const r = Module.exports.VF2(sqrtA, sqrtB, A.byteOffset, B.byteOffset);
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

  return { result, time: end - start, algorithm: "VF2" };
};
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
  const r = Module.exports.ULLMANN(sqrtA, sqrtB, A.byteOffset, B.byteOffset);
  const end = new Date().getTime();
  const result = new Int32Array(memory.buffer, r);
  console.log(result);
  const length = result[0];
  const matrix = [];
  for (let i = 0; i < length; i++) {
    matrix[i] = [];
    for (let j = 0; j < sqrtA; j++) {
      matrix[i][j] = new Array(sqrtB).fill(0);
    }
  }
  for (let i = 0; i < length; i++) {
    const base = 1 + i * sqrtA * 2;

    for (let j = 0; j < sqrtA; j++) {
      const _i = result[base + j * 2];
      const _j = result[base + j * 2 + 1];
      matrix[i][_i][_j] = 1;
    }
  }
  setTimeout(() => {
    for (let i = 0; i < result[0]; i++) {
      const index = i + 1;
      console.log(`result ${index}`);
      const result = matrix[i];
      let str = "";
      for (let j = 0; j < sqrtA; j++) {
        str += result[j].join(" ") + "\n";
      }
      console.log(str);
    }
  }, 1);

  return { result, time: end - start, algorithm: "ULLMANN", matrix };
};

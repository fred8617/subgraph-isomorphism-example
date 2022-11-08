// eslint-disable-next-line import/no-webpack-loader-syntax
const worker = require("workerize-loader!./find-isomorphism.worker");
const instance = worker();
export const ULLMANN_SIMPLE_CALLBACK: (
  a: number[],
  b: number[]
) => { result: Int32Array; time: number } = instance.ULLMANN_SIMPLE_CALLBACK;

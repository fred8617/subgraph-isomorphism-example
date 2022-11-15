// eslint-disable-next-line import/no-webpack-loader-syntax
const worker = require("workerize-loader!./find-isomorphism.worker");
const instance = worker();
type Result = {
  result: Int32Array;
  time: number;
  algorithm: string;
};
export const ULLMANN: (a: number[], b: number[]) => Result = instance.ULLMANN;
export const VF: (a: number[], b: number[]) => Result = instance.VF;
export default {
  ULLMANN,
  VF,
};

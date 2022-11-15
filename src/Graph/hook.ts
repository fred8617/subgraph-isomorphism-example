import { useQuery } from "@tanstack/react-query";
import findIsomorphism from "../find-isomorphism";
import { FIND_ISOMORPHISM } from "./context";
const queryKey = ["fi"];
export const useFindIsomorpism = (
  simpleDataA: number[],
  simpleDataB: number[],
  algorithm: FIND_ISOMORPHISM
) => {
  return {
    queryKey,
    ...useQuery({
      enabled: false,
      queryKey,
      queryFn: async () => {
        return await findIsomorphism[algorithm](simpleDataA, simpleDataB);
      },
      select: (data) => {
        const { result, time, algorithm } = data;
        const sqrtA = Math.sqrt(simpleDataA.length);
        const sqrtB = Math.sqrt(simpleDataB.length);
        const base = { ALength: sqrtA, BLength: sqrtB };
        const resultMaps: number[][][] = [];
        if (algorithm === FIND_ISOMORPHISM.ULLMANN) {
          const matrix: number[][][] = [];
          for (let i = 0; i < result[0]; i++) {
            const multiSqrt = sqrtA * sqrtB;
            matrix[i] = [];
            resultMaps[i] = [];
            for (let j = 0; j < sqrtA; j++) {
              matrix[i][j] = [];
              for (let k = 0; k < sqrtB; k++) {
                const value = result[j * sqrtB + k + i * multiSqrt + 1];
                matrix[i][j][k] = value;
                if (value === 1) {
                  resultMaps[i].push([j, k]);
                }
              }
            }
          }
          return {
            matrix,
            result,
            time,
            length: matrix.length,
            resultMaps,
            algorithm,
            ...base,
          };
        } else if (algorithm === FIND_ISOMORPHISM.VF) {
          for (let i = 0; i < result[0]; i++) {
            resultMaps[i] = [];

            for (let j = 0; j < sqrtA; j++) {
              const index = 1 + 2 * i * sqrtA + j * 2;
              resultMaps[i].push([result[index + 1], result[index]]);
            }
          }
          return {
            matrix: [],
            result,
            time,
            resultMaps,
            length: resultMaps.length,
            algorithm,
            ...base,
          };
        }
      },
    }),
  };
};

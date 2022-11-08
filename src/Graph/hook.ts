import { useQuery } from "@tanstack/react-query";
import { ULLMANN_SIMPLE_CALLBACK } from "../find-isomorphism";
const queryKey = ["fi"];
export const useFindIsomorpism = (
  simpleDataA: number[],
  simpleDataB: number[]
) => {
  return {
    queryKey,
    ...useQuery({
      enabled: false,
      queryKey,
      queryFn: async () => {
        return await ULLMANN_SIMPLE_CALLBACK(simpleDataA, simpleDataB);
      },
      select: (data) => {
        const { result, time } = data;
        const resultMaps: number[][][] = [];
        const sqrtA = Math.sqrt(simpleDataA.length);
        const sqrtB = Math.sqrt(simpleDataB.length);
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
        return { matrix, result, time, length: matrix.length, resultMaps };
      },
    }),
  };
};

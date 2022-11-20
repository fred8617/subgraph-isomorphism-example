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
        const { result, time, algorithm, matrix } = data;
        const sqrtA = Math.sqrt(simpleDataA.length);
        const sqrtB = Math.sqrt(simpleDataB.length);
        const base = { ALength: sqrtA, BLength: sqrtB };
        const resultMaps: number[][][] = [];
        if (algorithm === FIND_ISOMORPHISM.ULLMANN) {
          for (let i = 0; i < result[0]; i++) {
            resultMaps[i] = [];
            for (let j = 0; j < sqrtA; j++) {
              const index = 1 + 2 * i * sqrtA + j * 2;
              resultMaps[i].push([result[index], result[index + 1]]);
            }
          }
          return {
            matrix,
            result,
            time,
            length: resultMaps.length,
            resultMaps,
            algorithm,
            ...base,
          };
        } else if (
          algorithm === FIND_ISOMORPHISM.VF ||
          algorithm === FIND_ISOMORPHISM.VF2
        ) {
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

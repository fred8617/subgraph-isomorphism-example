import React, { useContext } from "react";

type GraphContext = {
  simpleDataA: number[];
  simpleDataB: number[];
};
export enum FIND_ISOMORPHISM {
  ULLMANN = "ULLMANN",
  VF = "VF",
}
export const Context = React.createContext<GraphContext>({} as GraphContext);
const { Provider } = Context;
export { Provider };
export const useGraphContext = () => {
  return useContext(Context);
};

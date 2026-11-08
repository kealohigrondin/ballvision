import { createContext, useContext } from "react";

import type { useEspnDataState } from "../hooks/useEspnDataState";

export type EspnData = ReturnType<typeof useEspnDataState>;
export const espnDataContext = createContext<EspnData | undefined>(undefined);

export const useEspnData = () => {
  const context = useContext(espnDataContext);
  if (!context)
    throw new Error("useEspnData must be used within EspnDataProvider.");
  return context;
};

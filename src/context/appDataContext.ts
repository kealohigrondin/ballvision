import { createContext, useContext } from "react";

import type { useAppDataState } from "../hooks/useAppDataState";

export type AppData = ReturnType<typeof useAppDataState>;
export const appDataContext = createContext<AppData | undefined>(undefined);

export const useAppData = () => {
  const context = useContext(appDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider.");
  }

  return context;
};

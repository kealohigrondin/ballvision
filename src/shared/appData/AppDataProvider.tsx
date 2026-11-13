import type { ReactNode } from "react";

import { appDataContext } from "./appDataContext";
import { useAppDataState } from "./useAppDataState";

type AppDataProviderProps = { children: ReactNode };

export const AppDataProvider = ({ children }: AppDataProviderProps) => {
  const value = useAppDataState();

  return (
    <appDataContext.Provider value={value}>{children}</appDataContext.Provider>
  );
};

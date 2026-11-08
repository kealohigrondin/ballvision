import { createContext, useContext } from "react";

import type { usePolymarketGameState } from "../hooks/usePolymarketGameState";

export type PolymarketGameData = ReturnType<typeof usePolymarketGameState>;
export const polymarketGameContext = createContext<
  PolymarketGameData | undefined
>(undefined);

export const usePolymarketGame = () => {
  const context = useContext(polymarketGameContext);
  if (!context)
    throw new Error(
      "usePolymarketGame must be used within PolymarketGameProvider.",
    );
  return context;
};

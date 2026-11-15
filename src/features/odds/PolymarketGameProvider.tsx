import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";
import type { Game } from "@/shared/types";

import { usePolymarketData } from "./polymarketDataContext";
import { polymarketGameContext } from "./polymarketGameContext";
import { usePolymarketGameState } from "./usePolymarketGameState";

type PolymarketGameProviderProps = { children: ReactNode; game: Game };

export const PolymarketGameProvider = ({
  children,
  game,
}: PolymarketGameProviderProps) => {
  const { paused } = useAppData();
  const { quotes, loading, error, historySource } = usePolymarketData();
  const value = usePolymarketGameState(game, {
    quote: quotes[game.id],
    loading,
    error,
    paused,
    historySource,
  });

  return (
    <polymarketGameContext.Provider value={value}>
      {children}
    </polymarketGameContext.Provider>
  );
};

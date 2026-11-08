import type { ReactNode } from "react";

import { polymarketGameContext } from "../context/polymarketGameContext";
import type { Game } from "../data/types";
import { usePolymarketGameState } from "../hooks/usePolymarketGameState";

type PolymarketGameProviderProps = { children: ReactNode; game: Game };

export const PolymarketGameProvider = ({
  children,
  game,
}: PolymarketGameProviderProps) => {
  const value = usePolymarketGameState(game);

  return (
    <polymarketGameContext.Provider value={value}>
      {children}
    </polymarketGameContext.Provider>
  );
};

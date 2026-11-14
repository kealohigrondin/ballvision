import { useState } from "react";

import type { Game } from "@/shared/types";

import type { GameOdds, OddsHistoryRange, OddsHistorySource } from "./types";

export type PolymarketGameOptions = {
  quote?: GameOdds;
  loading: boolean;
  error: boolean;
  paused: boolean;
  historySource: OddsHistorySource;
};

// One game's market quote, plus the chart range its odds history uses.
export const usePolymarketGameState = (
  game: Game,
  options: PolymarketGameOptions,
) => {
  const [range, setRange] = useState<OddsHistoryRange>("1h");

  return { game, ...options, range, setRange };
};

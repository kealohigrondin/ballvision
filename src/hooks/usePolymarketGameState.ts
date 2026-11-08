import { useState } from "react";
import { useAppData } from "../context/appDataContext";
import { usePolymarketData } from "../context/polymarketDataContext";
import type { Game, OddsHistoryRange } from "../data/types";
import { useOddsHistory } from "./useOddsHistory";

export const usePolymarketGameState = (game: Game) => {
  const { paused } = useAppData();
  const { quotes, loading, error, historySource } = usePolymarketData();
  const quote = quotes[game.id];
  const [historyOpen, setHistoryOpen] = useState(false);
  const [range, setRange] = useState<OddsHistoryRange>("1h");
  const query = quote
    ? { awayTokenId: quote.awayTokenId, homeTokenId: quote.homeTokenId, range }
    : undefined;
  const history = useOddsHistory(historySource, query, paused, historyOpen);
  return {
    game,
    quote,
    loading,
    error,
    paused,
    historyOpen,
    setHistoryOpen,
    range,
    setRange,
    history,
  };
};

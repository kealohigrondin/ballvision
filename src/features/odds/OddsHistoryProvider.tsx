import type { ReactNode } from "react";

import { oddsHistoryContext } from "./oddsHistoryContext";
import { usePolymarketGame } from "./polymarketGameContext";
import { useOddsHistory } from "./useOddsHistory";

type OddsHistoryProviderProps = { children: ReactNode };

// Loads the game's odds history only while this provider is mounted, so
// collapsed cards make no history requests.
export const OddsHistoryProvider = ({ children }: OddsHistoryProviderProps) => {
  const { quote, range, paused, historySource } = usePolymarketGame();
  const query = quote
    ? { awayTokenId: quote.awayTokenId, homeTokenId: quote.homeTokenId, range }
    : undefined;
  const value = useOddsHistory(historySource, query, paused);

  return (
    <oddsHistoryContext.Provider value={value}>
      {children}
    </oddsHistoryContext.Provider>
  );
};

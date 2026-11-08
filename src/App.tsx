import { ScoreCelebrationProvider } from "./providers/ScoreCelebrationProvider";
import { EspnDataProvider } from "./providers/EspnDataProvider";
import { PolymarketDataProvider } from "./providers/PolymarketDataProvider";
import { AppDataProvider } from "./providers/AppDataProvider";
import { Dashboard } from "./components/Dashboard";
import type {
  LeagueSource,
  ScoreboardSource,
  OddsSource,
  OddsHistorySource,
} from "./data/types";

type AppProps = {
  source?: ScoreboardSource;
  leagueSource?: LeagueSource;
  oddsSource?: OddsSource;
  oddsHistorySource?: OddsHistorySource;
};

const App = ({
  source,
  leagueSource,
  oddsSource,
  oddsHistorySource,
}: AppProps) => (
  <AppDataProvider>
    <EspnDataProvider source={source} leagueSource={leagueSource}>
      <PolymarketDataProvider
        source={oddsSource}
        historySource={oddsHistorySource}
      >
        <ScoreCelebrationProvider>
          <Dashboard />
        </ScoreCelebrationProvider>
      </PolymarketDataProvider>
    </EspnDataProvider>
  </AppDataProvider>
);

export default App;

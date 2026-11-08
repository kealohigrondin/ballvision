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
  TeamScheduleSource,
} from "./data/types";

type AppProps = {
  source?: ScoreboardSource;
  leagueSource?: LeagueSource;
  scheduleSource?: TeamScheduleSource;
  oddsSource?: OddsSource;
  oddsHistorySource?: OddsHistorySource;
};

const App = ({
  source,
  leagueSource,
  scheduleSource,
  oddsSource,
  oddsHistorySource,
}: AppProps) => (
  <AppDataProvider>
    <EspnDataProvider
      source={source}
      leagueSource={leagueSource}
      scheduleSource={scheduleSource}
    >
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

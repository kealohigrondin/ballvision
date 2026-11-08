import { Dashboard } from "./components/Dashboard";
import type {
  LeagueSource,
  OddsHistorySource,
  OddsSource,
  ScoreboardSource,
  TeamScheduleSource,
} from "./data/types";
import { AppDataProvider } from "./providers/AppDataProvider";
import { EspnDataProvider } from "./providers/EspnDataProvider";
import { PolymarketDataProvider } from "./providers/PolymarketDataProvider";
import { ScoreNotificationProvider } from "./providers/ScoreNotificationProvider";

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
        <ScoreNotificationProvider>
          <Dashboard />
        </ScoreNotificationProvider>
      </PolymarketDataProvider>
    </EspnDataProvider>
  </AppDataProvider>
);

export default App;

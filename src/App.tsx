import { Dashboard } from "./components/Dashboard";
import type {
  FantasySource,
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
import { SleeperDataProvider } from "./providers/SleeperDataProvider";

type AppProps = {
  source?: ScoreboardSource;
  leagueSource?: LeagueSource;
  scheduleSource?: TeamScheduleSource;
  oddsSource?: OddsSource;
  oddsHistorySource?: OddsHistorySource;
  fantasySource?: FantasySource;
};

const App = ({
  source,
  leagueSource,
  scheduleSource,
  oddsSource,
  oddsHistorySource,
  fantasySource,
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
        <SleeperDataProvider source={fantasySource}>
          <ScoreNotificationProvider>
            <Dashboard />
          </ScoreNotificationProvider>
        </SleeperDataProvider>
      </PolymarketDataProvider>
    </EspnDataProvider>
  </AppDataProvider>
);

export default App;

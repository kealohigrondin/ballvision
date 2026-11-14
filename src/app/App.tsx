import type { OddsHistorySource, OddsSource } from "@/features/odds";
import { ScheduleProvider, type TeamScheduleSource } from "@/features/schedule";
import { type ScoreboardSource, ScoresProvider } from "@/features/scores";
import { type LeagueSource, StandingsProvider } from "@/features/standings";
import { StatsProvider, type TeamStatsSource } from "@/features/stats";
import { AppDataProvider } from "@/shared/appData/AppDataProvider";

import { Dashboard } from "./Dashboard";
import { GameDataProviders } from "./GameDataProviders";

type AppProps = {
  source?: ScoreboardSource;
  leagueSource?: LeagueSource;
  scheduleSource?: TeamScheduleSource;
  statsSource?: TeamStatsSource;
  oddsSource?: OddsSource;
  oddsHistorySource?: OddsHistorySource;
};

const App = ({
  source,
  leagueSource,
  scheduleSource,
  statsSource,
  oddsSource,
  oddsHistorySource,
}: AppProps) => (
  <AppDataProvider>
    <ScoresProvider source={source}>
      <StandingsProvider source={leagueSource}>
        <ScheduleProvider source={scheduleSource}>
          <StatsProvider source={statsSource}>
            <GameDataProviders
              oddsSource={oddsSource}
              oddsHistorySource={oddsHistorySource}
            >
              <Dashboard />
            </GameDataProviders>
          </StatsProvider>
        </ScheduleProvider>
      </StandingsProvider>
    </ScoresProvider>
  </AppDataProvider>
);

export default App;

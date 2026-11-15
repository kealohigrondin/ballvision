import type { FantasySource } from "@/features/fantasy";
import type { OddsHistorySource, OddsSource } from "@/features/odds";
import { ScheduleProvider, type TeamScheduleSource } from "@/features/schedule";
import {
  type GameSummarySource,
  type ScoreboardSource,
  ScoresProvider,
} from "@/features/scores";
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
  summarySource?: GameSummarySource;
  fantasySource?: FantasySource;
};

const App = ({
  source,
  leagueSource,
  scheduleSource,
  statsSource,
  oddsSource,
  oddsHistorySource,
  summarySource,
  fantasySource,
}: AppProps) => (
  <AppDataProvider>
    <ScoresProvider source={source} summarySource={summarySource}>
      <StandingsProvider source={leagueSource}>
        <ScheduleProvider source={scheduleSource}>
          <StatsProvider source={statsSource}>
            <GameDataProviders
              oddsSource={oddsSource}
              oddsHistorySource={oddsHistorySource}
              fantasySource={fantasySource}
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

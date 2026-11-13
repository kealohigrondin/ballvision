import type { ReactNode } from "react";
import { vi } from "vitest";

import { scoreNotificationContext } from "@/features/notifications/scoreNotificationContext";
import {
  type PolymarketData,
  polymarketDataContext,
} from "@/features/odds/polymarketDataContext";
import type { OddsSource } from "@/features/odds/types";
import {
  scheduleContext,
  type ScheduleData,
} from "@/features/schedule/scheduleContext";
import {
  scoresContext,
  type ScoresData,
} from "@/features/scores/scoresContext";
import type { ScoreboardSource } from "@/features/scores/types";
import {
  standingsContext,
  type StandingsData,
} from "@/features/standings/standingsContext";
import { statsContext, type StatsData } from "@/features/stats/statsContext";
import { type AppData, appDataContext } from "@/shared/appData/appDataContext";

export const emptyOddsSource: OddsSource = {
  load: vi.fn().mockResolvedValue({}),
};
export const emptyScoreboardSource: ScoreboardSource = {
  load: vi.fn().mockResolvedValue([]),
  loadCalendar: vi.fn().mockResolvedValue({ weeks: [] }),
};

export const createAppData = (overrides: Partial<AppData> = {}): AppData => ({
  panelOpen: true,
  setPanelOpen: vi.fn(),
  panelView: "standings",
  setPanelView: vi.fn(),
  week: null,
  setWeek: vi.fn(),
  division: "fbs",
  setDivision: vi.fn(),
  filter: "all",
  setFilter: vi.fn(),
  search: "",
  setSearch: vi.fn(),
  paused: false,
  setPaused: vi.fn(),
  nflStandingsView: "wildcard",
  setNflStandingsView: vi.fn(),
  standingsConferenceId: "",
  setStandingsConferenceId: vi.fn(),
  selectedTeam: undefined,
  selectTeam: vi.fn(),
  favoriteIds: [],
  toggleFavorite: vi.fn(),
  ...overrides,
});

export const createScoresData = (
  overrides: Partial<ScoresData> = {},
): ScoresData => ({
  games: [],
  visibleGames: [],
  loading: false,
  error: null,
  updatedAt: new Date(),
  refresh: vi.fn(),
  weeks: [],
  currentWeekId: undefined,
  counts: { all: 0, live: 0, upcoming: 0, final: 0, pinned: 0 },
  ...overrides,
});

export const createStandingsData = (
  overrides: Partial<StandingsData> = {},
): StandingsData => ({
  tables: [],
  loading: false,
  error: false,
  refresh: vi.fn(),
  view: "standings",
  selected: undefined,
  selectedId: "",
  setSelectedId: vi.fn(),
  visibleTables: [],
  teams: [],
  ...overrides,
});

export const createScheduleData = (
  overrides: Partial<ScheduleData> = {},
): ScheduleData => ({
  data: undefined,
  loading: false,
  error: false,
  refresh: vi.fn(),
  ...overrides,
});

export const createStatsData = (
  overrides: Partial<StatsData> = {},
): StatsData => ({
  data: undefined,
  loading: false,
  error: false,
  refresh: vi.fn(),
  ...overrides,
});

export const createPolymarketData = (
  overrides: Partial<PolymarketData> = {},
): PolymarketData => ({
  quotes: {},
  loading: false,
  error: false,
  refresh: vi.fn(),
  historySource: { load: vi.fn().mockResolvedValue({ away: [], home: [] }) },
  ...overrides,
});

type AppDataTestProviderProps = {
  children: ReactNode;
  value: AppData;
  scores?: Partial<ScoresData>;
  standings?: Partial<StandingsData>;
  schedule?: Partial<ScheduleData>;
  stats?: Partial<StatsData>;
  polymarket?: Partial<PolymarketData>;
};

// Supplies every app context with fixed test values.
export const AppDataTestProvider = ({
  children,
  value,
  scores,
  standings,
  schedule,
  stats,
  polymarket,
}: AppDataTestProviderProps) => (
  <appDataContext.Provider value={value}>
    <scoresContext.Provider value={createScoresData(scores)}>
      <standingsContext.Provider value={createStandingsData(standings)}>
        <scheduleContext.Provider value={createScheduleData(schedule)}>
          <statsContext.Provider value={createStatsData(stats)}>
            <polymarketDataContext.Provider
              value={createPolymarketData(polymarket)}
            >
              <scoreNotificationContext.Provider
                value={{
                  current: undefined,
                  pending: 0,
                  dismiss: vi.fn(),
                  dismissAll: vi.fn(),
                  preview: vi.fn(),
                  previewAvailable: false,
                  soundArmed: false,
                  muted: false,
                  audioUnavailable: false,
                  enableSound: vi.fn().mockResolvedValue(undefined),
                  toggleMute: vi.fn(),
                }}
              >
                {children}
              </scoreNotificationContext.Provider>
            </polymarketDataContext.Provider>
          </statsContext.Provider>
        </scheduleContext.Provider>
      </standingsContext.Provider>
    </scoresContext.Provider>
  </appDataContext.Provider>
);

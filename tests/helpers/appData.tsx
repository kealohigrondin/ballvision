import type { ReactNode } from "react";
import { vi } from "vitest";
import { appDataContext, type AppData } from "../../src/context/appDataContext";

export const createAppData = (overrides: Partial<AppData> = {}): AppData => ({
  panelOpen: true,
  setPanelOpen: vi.fn(),
  week: null,
  setWeek: vi.fn(),
  weeks: [],
  currentWeekId: undefined,
  division: "fbs",
  setDivision: vi.fn(),
  filter: "all",
  setFilter: vi.fn(),
  search: "",
  setSearch: vi.fn(),
  paused: false,
  setPaused: vi.fn(),
  games: [],
  loading: false,
  error: null,
  updatedAt: new Date(),
  refresh: vi.fn(),
  favoriteIds: [],
  toggleFavorite: vi.fn(),
  counts: { all: 0, live: 0, upcoming: 0, final: 0, pinned: 0 },
  visibleGames: [],
  leagueSource: {
    loadStandings: vi.fn().mockResolvedValue([]),
    loadRankings: vi.fn().mockResolvedValue([]),
  },
  ...overrides,
});

type AppDataTestProviderProps = { children: ReactNode; value: AppData };
export const AppDataTestProvider = ({
  children,
  value,
}: AppDataTestProviderProps) => (
  <appDataContext.Provider value={value}>{children}</appDataContext.Provider>
);

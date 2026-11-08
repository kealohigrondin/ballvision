import { scoreNotificationContext } from "../../src/context/scoreNotificationContext";
import type { ReactNode } from "react";
import { vi } from "vitest";
import type { OddsSource, ScoreboardSource } from "../../src/data/types";
import { appDataContext, type AppData } from "../../src/context/appDataContext";
import {
  espnDataContext,
  type EspnData,
} from "../../src/context/espnDataContext";
import {
  polymarketDataContext,
  type PolymarketData,
} from "../../src/context/polymarketDataContext";

export const emptyOddsSource: OddsSource = {
  load: vi.fn().mockResolvedValue({}),
};
export const emptyScoreboardSource: ScoreboardSource = {
  load: vi.fn().mockResolvedValue([]),
};
export const createAppData = (overrides: Partial<AppData> = {}): AppData => ({
  panelOpen: true,
  setPanelOpen: vi.fn(),
  date: "2026-11-07",
  setDate: vi.fn(),
  division: "fbs",
  setDivision: vi.fn(),
  filter: "all",
  setFilter: vi.fn(),
  search: "",
  setSearch: vi.fn(),
  paused: false,
  setPaused: vi.fn(),
  favoriteIds: [],
  toggleFavorite: vi.fn(),
  ...overrides,
});
export const createEspnData = (
  overrides: Partial<EspnData> = {},
): EspnData => ({
  games: [],
  visibleGames: [],
  loading: false,
  error: null,
  updatedAt: new Date(),
  refresh: vi.fn(),
  counts: { all: 0, live: 0, upcoming: 0, final: 0, pinned: 0 },
  schedule: {
    selectedTeam: undefined,
    selectTeam: vi.fn(),
    data: undefined,
    loading: false,
    error: false,
    refresh: vi.fn(),
  },
  league: {
    tables: [],
    loading: false,
    error: false,
    refresh: vi.fn(),
    view: "standings",
    setView: vi.fn(),
    selected: undefined,
    selectedId: "",
    setSelectedId: vi.fn(),
  },
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
  espn?: Partial<EspnData>;
  polymarket?: Partial<PolymarketData>;
};
export const AppDataTestProvider = ({
  children,
  value,
  espn,
  polymarket,
}: AppDataTestProviderProps) => (
  <appDataContext.Provider value={value}>
    <espnDataContext.Provider value={createEspnData(espn)}>
      <polymarketDataContext.Provider value={createPolymarketData(polymarket)}>
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
    </espnDataContext.Provider>
  </appDataContext.Provider>
);

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { useAppData } from "../src/context/appDataContext";
import { useEspnData } from "../src/context/espnDataContext";
import { usePolymarketData } from "../src/context/polymarketDataContext";
import { usePolymarketGame } from "../src/context/polymarketGameContext";
import type {
  Game,
  LeagueSource,
  OddsHistorySource,
  OddsSource,
  ScoreboardSource,
  Week,
} from "../src/data/types";
import { AppDataProvider } from "../src/providers/AppDataProvider";
import { EspnDataProvider } from "../src/providers/EspnDataProvider";
import { PolymarketDataProvider } from "../src/providers/PolymarketDataProvider";
import { PolymarketGameProvider } from "../src/providers/PolymarketGameProvider";
import { emptyOddsSource } from "./helpers/appData";
import { oddsQuote } from "./helpers/oddsFixture";

const week = (number: number): Week => ({
  id: `2026-2-${number}`,
  label: `Week ${number}`,
  group: "Regular Season",
  detail: "",
  year: 2026,
  seasonType: 2,
  number,
});
const calendar = {
  weeks: [week(0), week(1), week(2)],
  currentWeekId: "2026-2-1",
};

const game = (id: string, state: Game["state"]): Game => ({
  id,
  state,
  home: {
    id: `${id}-home`,
    name: `${id} Home`,
    abbreviation: "HOM",
    color: "#123456",
    score: "7",
    quarters: [],
  },
  away: {
    id: `${id}-away`,
    name: `${id} Away`,
    abbreviation: "AWY",
    color: "#123456",
    score: "0",
    quarters: [],
  },
  status: "In progress",
  clock: "10:00",
  period: 1,
  start: "2026-11-07T20:00:00Z",
  broadcast: "",
  venue: "",
  situation: "",
  lastPlay: "",
  redZone: false,
});

type Sources = {
  games?: Game[];
  oddsSource?: OddsSource;
  oddsHistorySource?: OddsHistorySource;
};

// Renders only the app's context providers (no UI) and returns what each
// context exposes, so tests call the context functions directly.
const renderContexts = ({
  games = [],
  oddsSource = emptyOddsSource,
  oddsHistorySource,
}: Sources = {}) => {
  const source: ScoreboardSource = {
    load: vi.fn().mockResolvedValue(games),
    loadCalendar: vi.fn().mockResolvedValue(calendar),
  };
  const leagueSource: LeagueSource = {
    loadStandings: vi.fn().mockResolvedValue([]),
    loadRankings: vi.fn().mockResolvedValue([]),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppDataProvider>
      <EspnDataProvider source={source} leagueSource={leagueSource}>
        <PolymarketDataProvider
          source={oddsSource}
          historySource={oddsHistorySource}
        >
          {children}
        </PolymarketDataProvider>
      </EspnDataProvider>
    </AppDataProvider>
  );
  const { result } = renderHook(
    () => ({
      app: useAppData(),
      espn: useEspnData(),
      odds: usePolymarketData(),
    }),
    { wrapper },
  );

  const lastQuery = (query: object) =>
    waitFor(() =>
      expect(source.load).toHaveBeenLastCalledWith(
        query,
        expect.any(AbortSignal),
      ),
    );

  return { result, source, lastQuery };
};

const twoGames = [game("Live", "live"), game("Later", "upcoming")];

const visibleIds = (games: Game[]) => games.map(({ id }) => id);

afterEach(() => {
  cleanup();
  // Clears saved app preferences and favorites between tests.
  localStorage.clear();
});

// Search, filters and favorites

it("filters games by team search", async () => {
  const { result } = renderContexts({ games: twoGames });
  await waitFor(() => expect(result.current.espn.games).toHaveLength(2));
  act(() => result.current.app.setSearch("Later"));
  expect(visibleIds(result.current.espn.visibleGames)).toEqual(["Later"]);
});

it("shows every game again when the search is cleared", async () => {
  const { result } = renderContexts({ games: twoGames });
  await waitFor(() => expect(result.current.espn.games).toHaveLength(2));
  act(() => result.current.app.setSearch("Later"));
  act(() => result.current.app.setSearch(""));
  expect(visibleIds(result.current.espn.visibleGames)).toEqual([
    "Live",
    "Later",
  ]);
});

it("filters games by state", async () => {
  const { result } = renderContexts({ games: twoGames });
  await waitFor(() => expect(result.current.espn.games).toHaveLength(2));
  act(() => result.current.app.setFilter("upcoming"));
  expect(visibleIds(result.current.espn.visibleGames)).toEqual(["Later"]);
});

it("counts games by state", async () => {
  const { result } = renderContexts({ games: twoGames });
  await waitFor(() => expect(result.current.espn.games).toHaveLength(2));
  expect(result.current.espn.counts).toMatchObject({
    all: 2,
    live: 1,
    upcoming: 1,
    final: 0,
    pinned: 0,
  });
});

it("shows only pinned games under the pinned filter", async () => {
  const { result } = renderContexts({ games: twoGames });
  await waitFor(() => expect(result.current.espn.games).toHaveLength(2));
  act(() => result.current.app.toggleFavorite("Later"));
  act(() => result.current.app.setFilter("pinned"));
  expect(visibleIds(result.current.espn.visibleGames)).toEqual(["Later"]);
});

it("unpins a pinned game", async () => {
  const { result } = renderContexts({ games: twoGames });
  await waitFor(() => expect(result.current.espn.games).toHaveLength(2));
  act(() => result.current.app.toggleFavorite("Later"));
  act(() => result.current.app.toggleFavorite("Later"));
  expect(result.current.espn.counts.pinned).toBe(0);
});

// Week selection

it("loads the current FBS week on start", async () => {
  const { lastQuery } = renderContexts();
  await lastQuery({ week: null, division: "fbs" });
});

it("loads the FBS season calendar on start", async () => {
  const { result, source } = renderContexts();
  await waitFor(() =>
    expect(result.current.espn.currentWeekId).toBe(calendar.currentWeekId),
  );
  expect(source.loadCalendar).toHaveBeenLastCalledWith(
    "fbs",
    expect.any(AbortSignal),
  );
});

it("loads the chosen week", async () => {
  const { result, lastQuery } = renderContexts();
  act(() => result.current.app.setWeek(week(0)));
  await lastQuery({ week: week(0), division: "fbs" });
});

// Division

it("keeps the chosen week when switching between college divisions", async () => {
  const { result, lastQuery } = renderContexts();
  act(() => result.current.app.setWeek(week(0)));
  act(() => result.current.app.setDivision("fcs"));
  await lastQuery({ week: week(0), division: "fcs" });
});

it("returns to the current week when switching to the NFL", async () => {
  const { result, lastQuery } = renderContexts();
  act(() => result.current.app.setWeek(week(0)));
  act(() => result.current.app.setDivision("nfl"));
  await lastQuery({ week: null, division: "nfl" });
});

// Auto-refresh

it("pauses auto-refresh", () => {
  const { result } = renderContexts();
  act(() => result.current.app.setPaused(true));
  expect(result.current.app.paused).toBe(true);
});

it("reloads scores when the scores are refreshed", async () => {
  const { result, source } = renderContexts();
  await waitFor(() => expect(source.load).toHaveBeenCalled());
  const calls = vi.mocked(source.load).mock.calls.length;
  act(() => result.current.espn.refresh());
  await waitFor(() =>
    expect(vi.mocked(source.load).mock.calls.length).toBeGreaterThan(calls),
  );
});

// Polymarket odds

it("loads Polymarket odds for live games", async () => {
  const { result } = renderContexts({
    games: [game("Live", "live")],
    oddsSource: { load: vi.fn().mockResolvedValue({ Live: oddsQuote }) },
  });
  await waitFor(() => expect(result.current.odds.quotes.Live).toBe(oddsQuote));
});

it("reloads odds when the odds are refreshed", async () => {
  const loadOdds = vi.fn().mockResolvedValue({ Live: oddsQuote });
  const { result } = renderContexts({
    games: [game("Live", "live")],
    oddsSource: { load: loadOdds },
  });
  await waitFor(() => expect(result.current.odds.quotes.Live).toBe(oddsQuote));
  const calls = loadOdds.mock.calls.length;
  act(() => result.current.odds.refresh());
  await waitFor(() =>
    expect(loadOdds.mock.calls.length).toBeGreaterThan(calls),
  );
});

// Renders the providers plus a single game's odds context.
const renderGameOdds = (loadHistory: OddsHistorySource["load"]) => {
  const live = game("Live", "live");

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppDataProvider>
      <EspnDataProvider
        source={{
          load: vi.fn().mockResolvedValue([live]),
          loadCalendar: vi.fn().mockResolvedValue(calendar),
        }}
        leagueSource={{
          loadStandings: vi.fn().mockResolvedValue([]),
          loadRankings: vi.fn().mockResolvedValue([]),
        }}
      >
        <PolymarketDataProvider
          source={{ load: vi.fn().mockResolvedValue({ Live: oddsQuote }) }}
          historySource={{ load: loadHistory }}
        >
          <PolymarketGameProvider game={live}>
            {children}
          </PolymarketGameProvider>
        </PolymarketDataProvider>
      </EspnDataProvider>
    </AppDataProvider>
  );

  return renderHook(() => usePolymarketGame(), { wrapper }).result;
};

const history = {
  away: [{ timestamp: Date.now() - 1000, probability: 0.6 }],
  home: [{ timestamp: Date.now() - 1000, probability: 0.4 }],
};

it("does not load odds history until it is opened", async () => {
  const loadHistory = vi.fn().mockResolvedValue(history);
  const result = renderGameOdds(loadHistory);
  await waitFor(() => expect(result.current.quote).toBe(oddsQuote));
  expect(loadHistory).not.toHaveBeenCalled();
});

it("loads odds history for the game's tokens when opened", async () => {
  const loadHistory = vi.fn().mockResolvedValue(history);
  const result = renderGameOdds(loadHistory);
  await waitFor(() => expect(result.current.quote).toBe(oddsQuote));
  act(() => result.current.setHistoryOpen(true));
  await waitFor(() =>
    expect(loadHistory).toHaveBeenCalledWith(
      { awayTokenId: "222", homeTokenId: "111", range: "1h" },
      expect.any(AbortSignal),
    ),
  );
});

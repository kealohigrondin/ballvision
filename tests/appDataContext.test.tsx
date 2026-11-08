import { copy } from "../src/copy";
import { linkTo, navRailButton } from "./helpers/queries";
import { emptyOddsSource } from "./helpers/appData";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import App from "../src/App";
import { AppTheme } from "../src/providers/AppTheme";
import type {
  Game,
  LeagueSource,
  ScoreboardSource,
  Week,
} from "../src/data/types";

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

const scoreTable = (id: string) =>
  copy.gameCard.scoresByPeriod(`${id} Away`, `${id} Home`);
const favoriteButton = (favorite: boolean, id: string) =>
  copy.gameCard.favorite(favorite, `${id} Away`, `${id} Home`);

afterEach(() => {
  cleanup();
  localStorage.removeItem("ballvision:app-data:v1");
  localStorage.removeItem("saturday:favorites:v1");
});

it("shares search, filters, and favorites between the header and game grid", async () => {
  const source: ScoreboardSource = {
    load: vi
      .fn()
      .mockResolvedValue([game("Live", "live"), game("Later", "upcoming")]),
    loadCalendar: vi.fn().mockResolvedValue(calendar),
  };
  const leagueSource: LeagueSource = {
    loadStandings: vi.fn().mockResolvedValue([]),
    loadRankings: vi.fn().mockResolvedValue([]),
  };
  render(
    <AppTheme>
      <App
        source={source}
        leagueSource={leagueSource}
        oddsSource={emptyOddsSource}
      />
    </AppTheme>,
  );
  await screen.findByRole("table", {
    name: scoreTable("Live"),
  });
  fireEvent.change(
    screen.getByRole("textbox", { name: copy.scoresHeader.search }),
    {
      target: { value: "Later" },
    },
  );
  expect(
    screen.queryByRole("table", {
      name: scoreTable("Live"),
    }),
  ).toBeNull();
  expect(
    screen.getByRole("table", {
      name: scoreTable("Later"),
    }),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: copy.scoresHeader.clearSearch }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: `${copy.scoresHeader.filters.upcoming} 1`,
    }),
  );
  expect(
    screen.queryByRole("table", {
      name: scoreTable("Live"),
    }),
  ).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: favoriteButton(false, "Later") }),
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: `${copy.scoresHeader.filters.pinned} 1`,
    }),
  );
  expect(
    screen.getByRole("table", {
      name: scoreTable("Later"),
    }),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: favoriteButton(true, "Later") }),
  );
  expect(screen.getByText(copy.grid.watchlistEmpty)).toBeTruthy();
});

it("shares week, division, panel visibility, and pause state across app features", async () => {
  const source: ScoreboardSource = {
    load: vi.fn().mockResolvedValue([]),
    loadCalendar: vi.fn().mockResolvedValue(calendar),
  };
  const leagueSource: LeagueSource = {
    loadStandings: vi.fn().mockResolvedValue([]),
    loadRankings: vi.fn().mockResolvedValue([]),
  };
  const lastQuery = (query: object) =>
    waitFor(() =>
      expect(source.load).toHaveBeenLastCalledWith(
        query,
        expect.any(AbortSignal),
      ),
    );
  render(
    <AppTheme>
      <App
        source={source}
        leagueSource={leagueSource}
        oddsSource={emptyOddsSource}
      />
    </AppTheme>,
  );
  await screen.findByText(copy.grid.noGames);
  await lastQuery({ week: null, division: "fbs" });
  const weekSelect = await screen.findByRole("combobox", {
    name: copy.week.label,
  });
  await waitFor(() => expect(weekSelect.textContent).toBe(week(1).label));
  fireEvent.mouseDown(weekSelect);
  fireEvent.click(await screen.findByRole("option", { name: week(0).label }));
  await lastQuery({ week: week(0), division: "fbs" });
  expect(
    screen
      .getByRole("button", { name: copy.week.previous })
      .hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: copy.week.next }));
  await lastQuery({ week: week(1), division: "fbs" });
  fireEvent.click(
    screen.getByRole("button", { name: copy.scoresHeader.divisions.fcs }),
  );
  await lastQuery({ week: week(1), division: "fcs" });
  fireEvent.click(
    screen.getByRole("button", { name: copy.scoresHeader.divisions.nfl }),
  );
  await lastQuery({ week: null, division: "nfl" });
  expect(source.loadCalendar).toHaveBeenLastCalledWith(
    "nfl",
    expect.any(AbortSignal),
  );
  fireEvent.click(screen.getByRole("button", { name: copy.week.next }));
  await lastQuery({ week: week(2), division: "nfl" });
  fireEvent.click(
    screen.getByRole("button", { name: copy.scoresHeader.thisWeek }),
  );
  await lastQuery({ week: null, division: "nfl" });
  await waitFor(() =>
    expect(leagueSource.loadStandings).toHaveBeenLastCalledWith(
      "nfl",
      expect.any(AbortSignal),
    ),
  );
  fireEvent.click(navRailButton("standings"));
  expect(
    screen.queryByRole("complementary", { name: copy.league.panel }),
  ).toBeNull();
  fireEvent.click(navRailButton("standings"));
  expect(
    screen.getByRole("complementary", { name: copy.league.panel }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: copy.sync.pause }));
  await screen.findByText(copy.sync.paused);
  fireEvent.click(screen.getByRole("button", { name: copy.sync.resume }));
  expect(screen.getByRole("button", { name: copy.sync.pause })).toBeTruthy();
});

it("shares injected ESPN and Polymarket data with nested odds views and refreshes both providers", async () => {
  const { oddsQuote } = await import("./helpers/oddsFixture");
  const source: ScoreboardSource = {
    load: vi.fn().mockResolvedValue([game("Live", "live")]),
    loadCalendar: vi.fn().mockResolvedValue(calendar),
  };
  const leagueSource: LeagueSource = {
    loadStandings: vi.fn().mockResolvedValue([]),
    loadRankings: vi.fn().mockResolvedValue([]),
  };
  const loadOdds = vi.fn().mockResolvedValue({ Live: oddsQuote });
  const loadHistory = vi.fn().mockResolvedValue({
    away: [{ timestamp: Date.now() - 1000, probability: 0.6 }],
    home: [{ timestamp: Date.now() - 1000, probability: 0.4 }],
  });
  render(
    <AppTheme>
      <App
        source={source}
        leagueSource={leagueSource}
        oddsSource={{ load: loadOdds }}
        oddsHistorySource={{ load: loadHistory }}
      />
    </AppTheme>,
  );
  await waitFor(() =>
    expect(linkTo(oddsQuote.url).textContent).toContain("AWY"),
  );
  expect(loadHistory).not.toHaveBeenCalled();
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
  await screen.findByRole("img", {
    name: copy.oddsHistory.chart("AWY", "HOM"),
  });
  expect(loadHistory).toHaveBeenCalledWith(
    { awayTokenId: "222", homeTokenId: "111", range: "1h" },
    expect.any(AbortSignal),
  );
  const scoreCalls = vi.mocked(source.load).mock.calls.length;
  const oddsCalls = loadOdds.mock.calls.length;
  fireEvent.click(screen.getByRole("button", { name: copy.sync.refresh }));
  await waitFor(() => {
    expect(vi.mocked(source.load).mock.calls.length).toBeGreaterThan(
      scoreCalls,
    );
    expect(loadOdds.mock.calls.length).toBeGreaterThan(oddsCalls);
  });
});

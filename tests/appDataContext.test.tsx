import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import App from "../src/App";
import { copy } from "../src/copy";
import type {
  Game,
  LeagueSource,
  OddsHistorySource,
  OddsSource,
  ScoreboardSource,
  Week,
} from "../src/data/types";
import { AppTheme } from "../src/providers/AppTheme";
import { emptyOddsSource } from "./helpers/appData";
import { oddsQuote } from "./helpers/oddsFixture";
import { linkTo } from "./helpers/queries";

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

type RenderAppOptions = {
  games?: Game[];
  oddsSource?: OddsSource;
  oddsHistorySource?: OddsHistorySource;
};

const renderApp = ({
  games = [],
  oddsSource = emptyOddsSource,
  oddsHistorySource,
}: RenderAppOptions = {}) => {
  const source: ScoreboardSource = {
    load: vi.fn().mockResolvedValue(games),
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
        oddsSource={oddsSource}
        oddsHistorySource={oddsHistorySource}
      />
    </AppTheme>,
  );

  const lastQuery = (query: object) =>
    waitFor(() =>
      expect(source.load).toHaveBeenLastCalledWith(
        query,
        expect.any(AbortSignal),
      ),
    );

  return { source, leagueSource, lastQuery };
};

const scoreTable = (id: string) =>
  screen.queryByRole("table", {
    name: copy.gameCard.scoresByPeriod(`${id} Away`, `${id} Home`),
  });

const findScoreTable = (id: string) =>
  screen.findByRole("table", {
    name: copy.gameCard.scoresByPeriod(`${id} Away`, `${id} Home`),
  });

const favoriteButton = (favorite: boolean, id: string) =>
  screen.getByRole("button", {
    name: copy.gameCard.favorite(favorite, `${id} Away`, `${id} Home`),
  });

const filterButton = (
  filter: keyof typeof copy.scoresHeader.filters,
  count: number,
) =>
  screen.getByRole("button", {
    name: `${copy.scoresHeader.filters[filter]} ${count}`,
  });

const searchBox = () =>
  screen.getByRole("textbox", { name: copy.scoresHeader.search });

const weekSelect = async () => {
  const select = await screen.findByRole("combobox", {
    name: copy.week.label,
  });
  // Wait for the calendar so the select shows the current week.
  await waitFor(() => expect(select.textContent).toBe(week(1).label));

  return select;
};

const chooseWeek = async (number: number) => {
  fireEvent.mouseDown(await weekSelect());
  fireEvent.click(
    await screen.findByRole("option", { name: week(number).label }),
  );
};

const divisionButton = (division: "fbs" | "fcs" | "nfl") =>
  screen.getByRole("button", { name: copy.scoresHeader.divisions[division] });

afterEach(() => {
  cleanup();
  // Clears saved app preferences and favorites between tests.
  localStorage.clear();
});

// Search, filters and favorites

it("filters games by team search and restores them when cleared", async () => {
  renderApp({ games: [game("Live", "live"), game("Later", "upcoming")] });
  await findScoreTable("Live");
  fireEvent.change(searchBox(), { target: { value: "Later" } });
  expect(scoreTable("Live")).toBeNull();
  expect(scoreTable("Later")).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: copy.scoresHeader.clearSearch }),
  );
  expect(scoreTable("Live")).toBeTruthy();
  expect(scoreTable("Later")).toBeTruthy();
});

it("filters games by state", async () => {
  renderApp({ games: [game("Live", "live"), game("Later", "upcoming")] });
  await findScoreTable("Live");
  fireEvent.click(filterButton("upcoming", 1));
  expect(scoreTable("Live")).toBeNull();
  expect(scoreTable("Later")).toBeTruthy();
  fireEvent.click(filterButton("live", 1));
  expect(scoreTable("Live")).toBeTruthy();
  expect(scoreTable("Later")).toBeNull();
});

it("pins a game to the watchlist and unpins it", async () => {
  renderApp({ games: [game("Live", "live"), game("Later", "upcoming")] });
  await findScoreTable("Live");
  fireEvent.click(favoriteButton(false, "Later"));
  fireEvent.click(filterButton("pinned", 1));
  expect(scoreTable("Later")).toBeTruthy();
  expect(scoreTable("Live")).toBeNull();
  fireEvent.click(favoriteButton(true, "Later"));
  expect(screen.getByText(copy.grid.watchlistEmpty)).toBeTruthy();
});

// Week selection

it("starts on the current FBS week", async () => {
  const { source, lastQuery } = renderApp();
  await screen.findByText(copy.grid.noGames);
  await lastQuery({ week: null, division: "fbs" });
  expect(source.loadCalendar).toHaveBeenLastCalledWith(
    "fbs",
    expect.any(AbortSignal),
  );
  await weekSelect();
});

it("loads the week chosen from the week select", async () => {
  const { lastQuery } = renderApp();
  const select = await weekSelect();
  fireEvent.mouseDown(select);
  fireEvent.click(await screen.findByRole("option", { name: week(0).label }));
  await lastQuery({ week: week(0), division: "fbs" });
  expect(select.textContent).toBe(week(0).label);
});

// Division

it("keeps the selected week when switching between college divisions", async () => {
  const { lastQuery } = renderApp();
  await chooseWeek(0);
  await lastQuery({ week: week(0), division: "fbs" });
  fireEvent.click(divisionButton("fcs"));
  await lastQuery({ week: week(0), division: "fcs" });
});

it("pauses and resumes auto-refresh", async () => {
  renderApp();
  await screen.findByText(copy.grid.noGames);
  fireEvent.click(screen.getByRole("button", { name: copy.sync.pause }));
  await screen.findByText(copy.sync.paused);
  fireEvent.click(screen.getByRole("button", { name: copy.sync.resume }));
  expect(screen.getByRole("button", { name: copy.sync.pause })).toBeTruthy();
});

// Polymarket odds

it("shows Polymarket odds in the game card", async () => {
  renderApp({
    games: [game("Live", "live")],
    oddsSource: { load: vi.fn().mockResolvedValue({ Live: oddsQuote }) },
  });
  await waitFor(() =>
    expect(linkTo(oddsQuote.url).textContent).toContain("AWY"),
  );
});

it("loads odds history only when game details are opened", async () => {
  const loadHistory = vi.fn().mockResolvedValue({
    away: [{ timestamp: Date.now() - 1000, probability: 0.6 }],
    home: [{ timestamp: Date.now() - 1000, probability: 0.4 }],
  });
  renderApp({
    games: [game("Live", "live")],
    oddsSource: { load: vi.fn().mockResolvedValue({ Live: oddsQuote }) },
    oddsHistorySource: { load: loadHistory },
  });
  await waitFor(() => linkTo(oddsQuote.url));
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
});

it("refreshes both scores and odds from the refresh button", async () => {
  const loadOdds = vi.fn().mockResolvedValue({ Live: oddsQuote });
  const { source } = renderApp({
    games: [game("Live", "live")],
    oddsSource: { load: loadOdds },
  });
  await waitFor(() => linkTo(oddsQuote.url));
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

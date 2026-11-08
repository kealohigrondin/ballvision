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
import type { Game, LeagueSource, ScoreboardSource } from "../src/data/types";

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
    name: "Live Away at Live Home scores by period",
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Search teams" }), {
    target: { value: "Later" },
  });
  expect(
    screen.queryByRole("table", {
      name: "Live Away at Live Home scores by period",
    }),
  ).toBeNull();
  expect(
    screen.getByRole("table", {
      name: "Later Away at Later Home scores by period",
    }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  fireEvent.click(screen.getByRole("button", { name: "Upcoming 1" }));
  expect(
    screen.queryByRole("table", {
      name: "Live Away at Live Home scores by period",
    }),
  ).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: "Favorite Later Away at Later Home" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Pinned 1" }));
  expect(
    screen.getByRole("table", {
      name: "Later Away at Later Home scores by period",
    }),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Unfavorite Later Away at Later Home" }),
  );
  expect(screen.getByText("Your watchlist starts here.")).toBeTruthy();
});

it("shares date, division, panel visibility, and pause state across app features", async () => {
  const source: ScoreboardSource = { load: vi.fn().mockResolvedValue([]) };
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
  await screen.findByText("No games on this field.");
  fireEvent.change(screen.getByLabelText("Game date"), {
    target: { value: "2026-11-08" },
  });
  await waitFor(() =>
    expect(source.load).toHaveBeenLastCalledWith(
      { date: "2026-11-08", division: "fbs" },
      expect.any(AbortSignal),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: /^NFL$/ }));
  await waitFor(() =>
    expect(source.load).toHaveBeenLastCalledWith(
      { date: "2026-11-08", division: "nfl" },
      expect.any(AbortSignal),
    ),
  );
  await waitFor(() =>
    expect(leagueSource.loadStandings).toHaveBeenLastCalledWith(
      "nfl",
      expect.any(AbortSignal),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Standings" }));
  expect(
    screen.queryByRole("complementary", { name: "League information" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Standings" }));
  expect(
    screen.getByRole("complementary", { name: "League information" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Pause auto-refresh" }));
  await screen.findByText("Auto-refresh paused");
  fireEvent.click(screen.getByRole("button", { name: "Resume auto-refresh" }));
  expect(
    screen.getByRole("button", { name: "Pause auto-refresh" }),
  ).toBeTruthy();
});

it("shares injected ESPN and Polymarket data with nested odds views and refreshes both providers", async () => {
  const { oddsQuote } = await import("./helpers/oddsFixture");
  const source: ScoreboardSource = {
    load: vi.fn().mockResolvedValue([game("Live", "live")]),
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
  await screen.findByRole("link", { name: "AWY -300" });
  expect(loadHistory).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Game details" }));
  await screen.findByRole("img", {
    name: "Polymarket implied win probability history for AWY and HOM",
  });
  expect(loadHistory).toHaveBeenCalledWith(
    { awayTokenId: "222", homeTokenId: "111", range: "1h" },
    expect.any(AbortSignal),
  );
  const scoreCalls = vi.mocked(source.load).mock.calls.length;
  const oddsCalls = loadOdds.mock.calls.length;
  fireEvent.click(screen.getByRole("button", { name: "Refresh scores" }));
  await waitFor(() => {
    expect(vi.mocked(source.load).mock.calls.length).toBeGreaterThan(
      scoreCalls,
    );
    expect(loadOdds.mock.calls.length).toBeGreaterThan(oddsCalls);
  });
});

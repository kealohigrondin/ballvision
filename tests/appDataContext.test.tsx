import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import App from "../src/App";
import { AppTheme } from "../src/components/AppTheme";
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
      <App source={source} leagueSource={leagueSource} />
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
      <App source={source} leagueSource={leagueSource} />
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
  fireEvent.click(screen.getByRole("button", { name: "Close league panel" }));
  expect(
    screen.queryByRole("complementary", { name: "League information" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Open league panel" }));
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

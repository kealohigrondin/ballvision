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

afterEach(() => {
  cleanup();
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
      <App source={source} leagueSource={leagueSource} />
    </AppTheme>,
  );
  await screen.findByText("No games on this field.");
  await lastQuery({ week: null, division: "fbs" });
  const weekSelect = await screen.findByRole("combobox", { name: "Week" });
  await waitFor(() => expect(weekSelect.textContent).toBe("Week 1"));
  fireEvent.mouseDown(weekSelect);
  fireEvent.click(await screen.findByRole("option", { name: "Week 0" }));
  await lastQuery({ week: week(0), division: "fbs" });
  expect(
    screen
      .getByRole("button", { name: "Previous week" })
      .hasAttribute("disabled"),
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Next week" }));
  await lastQuery({ week: week(1), division: "fbs" });
  fireEvent.click(screen.getByRole("button", { name: /^FCS$/ }));
  await lastQuery({ week: week(1), division: "fcs" });
  fireEvent.click(screen.getByRole("button", { name: /^NFL$/ }));
  await lastQuery({ week: null, division: "nfl" });
  expect(source.loadCalendar).toHaveBeenLastCalledWith(
    "nfl",
    expect.any(AbortSignal),
  );
  fireEvent.click(screen.getByRole("button", { name: "Next week" }));
  await lastQuery({ week: week(2), division: "nfl" });
  fireEvent.click(screen.getByRole("button", { name: "This week" }));
  await lastQuery({ week: null, division: "nfl" });
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

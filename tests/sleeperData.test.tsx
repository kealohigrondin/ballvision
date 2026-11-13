import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { useAppData } from "../src/context/appDataContext";
import { useSleeperData } from "../src/context/sleeperDataContext";
import type {
  FantasyLeague,
  FantasySource,
  LeagueSource,
  ScoreboardSource,
  Week,
} from "../src/data/types";
import { AppDataProvider } from "../src/providers/AppDataProvider";
import { EspnDataProvider } from "../src/providers/EspnDataProvider";
import { SleeperDataProvider } from "../src/providers/SleeperDataProvider";

const week = (seasonType: number, number: number): Week => ({
  id: `2026-${seasonType}-${number}`,
  label: `Week ${number}`,
  group: "",
  detail: "",
  year: 2026,
  seasonType,
  number,
});

const leagues: FantasyLeague[] = [
  {
    id: "L1",
    name: "Fanal Fantasy",
    players: [
      {
        id: "9228",
        name: "Bryce Young",
        position: "QB",
        team: "CAR",
        points: 12.76,
        starter: true,
      },
    ],
  },
];

// Renders the app data, ESPN and Sleeper providers (no UI) with ESPN's
// current week set to regular season week 9.
const renderSleeperData = () => {
  const source: FantasySource = { load: vi.fn().mockResolvedValue(leagues) };
  const scoreboard: ScoreboardSource = {
    load: vi.fn().mockResolvedValue([]),
    loadCalendar: vi.fn().mockResolvedValue({
      weeks: [week(2, 8), week(2, 9), week(3, 1)],
      currentWeekId: "2026-2-9",
    }),
  };
  const leagueSource: LeagueSource = {
    loadStandings: vi.fn().mockResolvedValue([]),
    loadRankings: vi.fn().mockResolvedValue([]),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppDataProvider>
      <EspnDataProvider source={scoreboard} leagueSource={leagueSource}>
        <SleeperDataProvider source={source}>{children}</SleeperDataProvider>
      </EspnDataProvider>
    </AppDataProvider>
  );
  const { result } = renderHook(
    () => ({ app: useAppData(), sleeper: useSleeperData() }),
    { wrapper },
  );

  return { result, source };
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("loads the user's fantasy players for the current NFL week", async () => {
  const { result, source } = renderSleeperData();
  act(() => {
    result.current.app.setDivision("nfl");
    result.current.app.setSleeperUsername("AaronY");
  });
  await waitFor(() => expect(result.current.sleeper.leagues).toBe(leagues));
  expect(source.load).toHaveBeenCalledWith(
    { username: "AaronY", season: 2026, week: 9 },
    expect.any(AbortSignal),
  );
});

it("loads the chosen NFL week", async () => {
  const { result, source } = renderSleeperData();
  act(() => {
    result.current.app.setDivision("nfl");
    result.current.app.setSleeperUsername("AaronY");
  });
  act(() => result.current.app.setWeek(week(2, 8)));
  await waitFor(() =>
    expect(source.load).toHaveBeenLastCalledWith(
      { username: "AaronY", season: 2026, week: 8 },
      expect.any(AbortSignal),
    ),
  );
});

it("loads nothing without a Sleeper username", async () => {
  const { result, source } = renderSleeperData();
  act(() => result.current.app.setDivision("nfl"));
  await waitFor(() => expect(result.current.sleeper.loading).toBe(false));
  expect(source.load).not.toHaveBeenCalled();
});

it("loads nothing for college football", async () => {
  const { result, source } = renderSleeperData();
  act(() => result.current.app.setSleeperUsername("AaronY"));
  await waitFor(() => expect(result.current.sleeper.loading).toBe(false));
  expect(source.load).not.toHaveBeenCalled();
});

it("loads nothing for NFL playoff weeks", async () => {
  const { result, source } = renderSleeperData();
  act(() => {
    result.current.app.setDivision("nfl");
    result.current.app.setSleeperUsername("AaronY");
  });
  act(() => result.current.app.setWeek(week(3, 1)));
  await waitFor(() => expect(result.current.sleeper.leagues).toEqual([]));
  expect(source.load).not.toHaveBeenCalledWith(
    expect.objectContaining({ week: 1 }),
    expect.any(AbortSignal),
  );
});

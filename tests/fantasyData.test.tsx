import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { GameDataProviders } from "@/app/GameDataProviders";
import type { EspnFantasySource } from "@/features/fantasy/espnFantasy";
import { useFantasyData } from "@/features/fantasy/fantasyDataContext";
import type { FantasyLeague, FantasySource } from "@/features/fantasy/types";
import { ScoresProvider } from "@/features/scores/ScoresProvider";
import type { ScoreboardSource } from "@/features/scores/types";
import { useAppData } from "@/shared/appData/appDataContext";
import { AppDataProvider } from "@/shared/appData/AppDataProvider";
import type { Week } from "@/shared/types";

import { emptyOddsSource } from "./helpers/appData";

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

// Renders the app data, scores and game data providers (no UI) with ESPN's
// current week set to regular season week 9.
const espnLeagues: FantasyLeague[] = [
  {
    id: "espn-899513",
    name: "ESPN League",
    players: [{ ...leagues[0].players[0], id: "4241457" }],
  },
];

const ESPN_TEAM_LINK =
  "https://fantasy.espn.com/football/team?leagueId=899513&teamId=4&seasonId=2026";

const renderFantasyData = () => {
  const source: FantasySource = { load: vi.fn().mockResolvedValue(leagues) };
  const espnSource: EspnFantasySource = {
    load: vi.fn().mockResolvedValue(espnLeagues),
  };
  const scoreboard: ScoreboardSource = {
    load: vi.fn().mockResolvedValue([]),
    loadCalendar: vi.fn().mockResolvedValue({
      weeks: [week(2, 8), week(2, 9), week(3, 1)],
      currentWeekId: "2026-2-9",
    }),
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppDataProvider>
      <ScoresProvider source={scoreboard}>
        <GameDataProviders
          oddsSource={emptyOddsSource}
          fantasySource={source}
          espnFantasySource={espnSource}
        >
          {children}
        </GameDataProviders>
      </ScoresProvider>
    </AppDataProvider>
  );
  const { result } = renderHook(
    () => ({ app: useAppData(), fantasy: useFantasyData() }),
    { wrapper },
  );

  return { result, source, espnSource };
};

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("loads the user's fantasy players for the current NFL week", async () => {
  const { result, source } = renderFantasyData();
  act(() => {
    result.current.app.setDivision("nfl");
    result.current.app.setSleeperUsername("AaronY");
  });
  await waitFor(() => expect(result.current.fantasy.leagues).toEqual(leagues));
  expect(source.load).toHaveBeenCalledWith(
    { username: "AaronY", season: 2026, week: 9 },
    expect.any(AbortSignal),
  );
});

it("loads the chosen NFL week", async () => {
  const { result, source } = renderFantasyData();
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
  const { result, source } = renderFantasyData();
  act(() => result.current.app.setDivision("nfl"));
  await waitFor(() => expect(result.current.fantasy.loading).toBe(false));
  expect(source.load).not.toHaveBeenCalled();
});

it("loads nothing for college football", async () => {
  const { result, source } = renderFantasyData();
  act(() => result.current.app.setSleeperUsername("AaronY"));
  await waitFor(() => expect(result.current.fantasy.loading).toBe(false));
  expect(source.load).not.toHaveBeenCalled();
});

it("loads nothing for NFL playoff weeks", async () => {
  const { result, source } = renderFantasyData();
  act(() => {
    result.current.app.setDivision("nfl");
    result.current.app.setSleeperUsername("AaronY");
  });
  act(() => result.current.app.setWeek(week(3, 1)));
  await waitFor(() => expect(result.current.fantasy.leagues).toEqual([]));
  expect(source.load).not.toHaveBeenCalledWith(
    expect.objectContaining({ week: 1 }),
    expect.any(AbortSignal),
  );
});

it("loads the linked ESPN team for the current NFL week", async () => {
  const { result, espnSource } = renderFantasyData();
  act(() => {
    result.current.app.setDivision("nfl");
    result.current.app.setEspnFantasyTeam(ESPN_TEAM_LINK);
  });
  await waitFor(() =>
    expect(espnSource.load).toHaveBeenCalledWith(
      { leagueId: "899513", teamId: "4", season: 2026, week: 9 },
      expect.any(AbortSignal),
    ),
  );
});

it("lists ESPN leagues alongside Sleeper leagues", async () => {
  const { result } = renderFantasyData();
  act(() => {
    result.current.app.setDivision("nfl");
    result.current.app.setSleeperUsername("AaronY");
    result.current.app.setEspnFantasyTeam(ESPN_TEAM_LINK);
  });
  await waitFor(() =>
    expect(result.current.fantasy.leagues).toEqual([
      ...leagues,
      ...espnLeagues,
    ]),
  );
});

it("loads nothing from ESPN for a link without league and team ids", async () => {
  const { result, espnSource } = renderFantasyData();
  act(() => {
    result.current.app.setDivision("nfl");
    result.current.app.setEspnFantasyTeam("https://fantasy.espn.com/football/");
  });
  await waitFor(() => expect(result.current.fantasy.loading).toBe(false));
  expect(espnSource.load).not.toHaveBeenCalled();
});

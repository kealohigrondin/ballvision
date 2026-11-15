import { afterEach, describe, expect, it, vi } from "vitest";

import { createPolymarketSource } from "@/features/odds/polymarket";
import { espnTeamScheduleSource } from "@/features/schedule/espnSchedule";
import { scheduleGameStatus } from "@/features/schedule/scheduleStatus";
import {
  espnLeagueSource,
  parseSoccerStandings,
} from "@/features/standings/espnStandings";
import { gameTime, periodLabel } from "@/shared/gameTime";
import type { Game } from "@/shared/types";

import eplStandings from "../e2e/fixtures/epl-standings.json";
import uclStandings from "../e2e/fixtures/ucl-standings.json";
import { oddsGame } from "./helpers/oddsFixture";
import { rawScheduleEvent, scheduleGame } from "./helpers/scheduleFixture";

type EntryOptions = {
  id: string;
  rank: number;
  note?: string;
};

const standingsEntry = ({ id, rank, note }: EntryOptions) => ({
  team: { id, shortDisplayName: `Team ${id}`, abbreviation: id },
  ...(note && { note: { description: note } }),
  stats: [
    { name: "rank", displayValue: String(rank) },
    { name: "gamesPlayed", displayValue: "10" },
    { name: "pointDifferential", displayValue: "+4" },
    { name: "points", displayValue: "21" },
    { name: "overall", type: "total", summary: "6-3-1" },
  ],
});

const standingsPayload = (entries: unknown[]) => ({
  children: [
    {
      id: "1",
      name: "League Phase",
      standings: { seasonDisplayName: "2026-27", entries },
    },
  ],
});

describe("parseSoccerStandings", () => {
  it("orders teams by table position", () => {
    const [table] = parseSoccerStandings(
      standingsPayload([
        standingsEntry({ id: "b", rank: 2 }),
        standingsEntry({ id: "a", rank: 1 }),
      ]),
    );
    expect(table.rows.map((row) => row.id)).toEqual(["a", "b"]);
  });

  it("reads played, W-D-L record, goal difference and points", () => {
    const [table] = parseSoccerStandings(
      standingsPayload([standingsEntry({ id: "a", rank: 1 })]),
    );
    expect(table.rows[0]).toMatchObject({
      rank: 1,
      played: "10",
      record: "6-3-1",
      goalDifference: "+4",
      points: "21",
    });
  });

  it("marks the table as soccer", () => {
    const [table] = parseSoccerStandings(standingsPayload([]));
    expect(table.soccer).toBe(true);
  });

  it("draws a line where the qualification zone changes", () => {
    const [table] = parseSoccerStandings(
      standingsPayload([
        standingsEntry({ id: "a", rank: 1, note: "Round of 16" }),
        standingsEntry({ id: "b", rank: 2, note: "Round of 16" }),
        standingsEntry({ id: "c", rank: 3, note: "Playoffs" }),
      ]),
    );
    expect(table.rows.map((row) => row.dividerAfter)).toEqual([
      undefined,
      "solid",
      undefined,
    ]);
  });

  // Lines come from real ESPN tables captured in the e2e fixtures.
  const dividers = (payload: unknown) =>
    parseSoccerStandings(payload)[0].rows.flatMap((row) =>
      row.dividerAfter
        ? [`${row.rank}/${(row.rank ?? 0) + 1} ${row.dividerAfter}`]
        : [],
    );

  it("dashes the Champions League lines within the knockout playoffs", () => {
    expect(dividers(uclStandings)).toEqual([
      "8/9 dashed",
      "16/17 dashed",
      "24/25 solid",
    ]);
  });

  it("dashes the Premier League relegation line and keeps the others solid", () => {
    expect(dividers(eplStandings)).toEqual([
      "4/5 solid",
      "5/6 solid",
      "17/18 dashed",
    ]);
  });

  it("puts each zone's note under its last team", () => {
    const [table] = parseSoccerStandings(
      standingsPayload([
        standingsEntry({ id: "a", rank: 1, note: "Round of 16" }),
        standingsEntry({ id: "b", rank: 2, note: "Round of 16" }),
        standingsEntry({ id: "c", rank: 3 }),
      ]),
    );
    expect(table.rows.map((row) => row.noteAfter)).toEqual([
      undefined,
      "Round of 16",
      undefined,
    ]);
  });

  it("notes the last zone of the table without a line under it", () => {
    const [table] = parseSoccerStandings(
      standingsPayload([
        standingsEntry({ id: "a", rank: 1 }),
        standingsEntry({ id: "b", rank: 2, note: "Relegation" }),
      ]),
    );
    expect(table.rows[1]).toMatchObject({ noteAfter: "Relegation" });
    expect(table.rows[1].dividerAfter).toBeUndefined();
  });

  it("rejects a payload without tables", () => {
    expect(() => parseSoccerStandings({})).toThrow();
  });
});

const respondWith = (body: unknown) =>
  vi
    .fn<typeof fetch>()
    .mockImplementation(async () => new Response(JSON.stringify(body)));

describe("espnLeagueSource for soccer", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads the Premier League table from ESPN's soccer standings", async () => {
    const fetcher = respondWith(standingsPayload([]));
    vi.stubGlobal("fetch", fetcher);
    await espnLeagueSource.loadStandings("epl", new AbortController().signal);
    expect(String(fetcher.mock.calls[0][0])).toBe(
      "https://site.api.espn.com/apis/v2/sports/soccer/eng.1/standings",
    );
  });

  it("has no polls to load for the Champions League", async () => {
    const fetcher = respondWith({});
    vi.stubGlobal("fetch", fetcher);
    const polls = await espnLeagueSource.loadRankings(
      "ucl",
      new AbortController().signal,
    );
    expect(polls).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });
});

describe("espnTeamScheduleSource for soccer", () => {
  afterEach(() => vi.unstubAllGlobals());

  const scheduleFetcher = () =>
    respondWith({ season: { year: 2026 }, events: [rawScheduleEvent] });

  it("loads played matches and upcoming fixtures", async () => {
    const fetcher = scheduleFetcher();
    vi.stubGlobal("fetch", fetcher);
    await espnTeamScheduleSource.load(
      { division: "epl", teamId: "1" },
      new AbortController().signal,
    );
    const urls = fetcher.mock.calls.map(([url]) => new URL(String(url)));
    expect(urls.map((url) => url.searchParams.get("fixture"))).toEqual([
      null,
      "true",
    ]);
    expect(urls[0].pathname).toContain("/soccer/eng.1/teams/1/schedule");
  });

  it("lists a match found in both responses once", async () => {
    vi.stubGlobal("fetch", scheduleFetcher());
    const schedule = await espnTeamScheduleSource.load(
      { division: "epl", teamId: "1" },
      new AbortController().signal,
    );
    expect(schedule.games.map((game) => game.id)).toEqual(["game"]);
  });
});

describe("scheduleGameStatus for soccer", () => {
  it("calls a level soccer result a draw", () => {
    const draw = {
      ...scheduleGame,
      sport: "soccer" as const,
      home: { ...scheduleGame.home, score: "1" },
      away: { ...scheduleGame.away, score: "1" },
    };
    expect(scheduleGameStatus(draw, "1")).toBe("D 1–1");
  });
});

const liveSoccerGame = (status: string, clock: string): Game => ({
  ...oddsGame,
  sport: "soccer",
  state: "live",
  status,
  clock,
  period: 2,
});

describe("gameTime for soccer", () => {
  it("shows the match minute", () => {
    expect(gameTime(liveSoccerGame("67'", "67'"))).toBe("67'");
  });

  it("shows ESPN's status at half time", () => {
    expect(gameTime(liveSoccerGame("HT", "45'+2'"))).toBe("HT");
  });
});

describe("periodLabel for soccer", () => {
  it("names halves, extra time and penalties", () => {
    expect([1, 2, 3, 5].map((period) => periodLabel(period, "soccer"))).toEqual(
      ["1H", "2H", "ET", "PENS"],
    );
  });
});

describe("createPolymarketSource for soccer", () => {
  it("skips Polymarket, whose soccer markets are three-way", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const quotes = await createPolymarketSource(fetcher).load(
      { division: "epl", games: [{ ...oddsGame, sport: "soccer" }] },
      new AbortController().signal,
    );
    expect(quotes).toEqual({});
    expect(fetcher).not.toHaveBeenCalled();
  });
});

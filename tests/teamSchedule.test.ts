import { afterEach, expect, it, vi } from "vitest";
import { espnTeamScheduleSource, parseTeamSchedule } from "../src/data/espn";
import { scheduleGameStatus } from "../src/utils/teamSchedule";
import { rawScheduleEvent, scheduleGame } from "./helpers/scheduleFixture";

afterEach(() => vi.unstubAllGlobals());
it("parses schedule-specific scores, logos, broadcasts, TBD times, and neutral sites in date order", () => {
  const schedule = parseTeamSchedule(
    {
      season: { year: 2026 },
      events: [
        {
          ...rawScheduleEvent,
          id: "later",
          date: "2026-11-28T05:00Z",
          timeValid: false,
        },
        rawScheduleEvent,
      ],
    },
    "1",
  );
  expect(schedule.season).toBe("2026");
  expect(schedule.games.map((game) => game.id)).toEqual(["game", "later"]);
  expect(schedule.games[0]).toMatchObject({
    home: {
      score: "35",
      logo: "https://a.espncdn.com/i/teamlogos/ncaa/500/61.png",
    },
    away: { score: "14" },
    broadcast: "ABC",
    neutralSite: true,
    state: "final",
  });
  expect(schedule.games[1].timeConfirmed).toBe(false);
  expect(
    parseTeamSchedule({ events: [rawScheduleEvent] }, "unrelated").games,
  ).toEqual([]);
  expect(() => parseTeamSchedule({}, "1")).toThrow();
});
it("loads and merges regular season and postseason with the correct sport, team, and cancellation signal", async () => {
  const response = (events: unknown[]) =>
    new Response(JSON.stringify({ season: { year: 2026 }, events }));
  const fetcher = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(response([rawScheduleEvent]))
    .mockResolvedValueOnce(
      response([
        rawScheduleEvent,
        { ...rawScheduleEvent, id: "bowl", date: "2026-12-28T20:00Z" },
      ]),
    );
  vi.stubGlobal("fetch", fetcher);
  const signal = new AbortController().signal;
  const schedule = await espnTeamScheduleSource.load(
    { division: "fbs", teamId: "1" },
    signal,
  );
  expect(schedule.games.map((game) => game.id)).toEqual(["game", "bowl"]);
  expect(String(fetcher.mock.calls[0][0])).toContain(
    "college-football/teams/1/schedule?seasontype=2",
  );
  expect(
    new URL(String(fetcher.mock.calls[1][0])).searchParams.get("seasontype"),
  ).toBe("3");
  expect(
    new URL(String(fetcher.mock.calls[1][0])).searchParams.get("season"),
  ).toBe("2026");
  expect(fetcher.mock.calls.every(([, init]) => init?.signal === signal)).toBe(
    true,
  );
  fetcher.mockImplementation(async () => response([]));
  await espnTeamScheduleSource.load({ division: "nfl", teamId: "3" }, signal);
  expect(String(fetcher.mock.calls[2][0])).toContain(
    "football/nfl/teams/3/schedule",
  );
});
it("shows results from the selected team’s perspective, live status, and unconfirmed kickoff times", () => {
  expect(scheduleGameStatus(scheduleGame, "1")).toBe("W 35–14");
  expect(scheduleGameStatus(scheduleGame, "8")).toBe("L 14–35");
  expect(scheduleGameStatus({ ...scheduleGame, state: "live" }, "1")).toContain(
    "Q1 · 10:00",
  );
  expect(
    scheduleGameStatus(
      { ...scheduleGame, state: "upcoming", timeConfirmed: false },
      "1",
    ),
  ).toBe("Time TBD");
  expect(
    scheduleGameStatus(
      { ...scheduleGame, state: "other", status: "Postponed" },
      "1",
    ),
  ).toBe("Postponed");
});

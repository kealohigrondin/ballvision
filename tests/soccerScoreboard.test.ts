import { afterEach, describe, expect, it, vi } from "vitest";

import {
  espnSource,
  parseMonthCalendar,
} from "@/features/scores/espnScoreboard";
import { parseScoreboard } from "@/shared/api/espn";

const competitor = (id: string, homeAway: string, score: string) => ({
  id,
  homeAway,
  score,
  records: [{ type: "total", summary: "7-1-2" }],
  team: { abbreviation: id, shortDisplayName: `${id} FC`, color: "112233" },
});

type SoccerEventOptions = {
  state?: string;
  details?: unknown[];
};

const soccerEvent = ({
  state = "in",
  details = [],
}: SoccerEventOptions = {}) => ({
  id: "1",
  uid: "s:600~l:700~e:1",
  date: "2026-11-21T15:00Z",
  status: {
    displayClock: "67'",
    period: 2,
    type: { state, name: "STATUS_SECOND_HALF", detail: "67'" },
  },
  competitions: [
    {
      competitors: [
        competitor("ARS", "home", "2"),
        competitor("CHE", "away", "1"),
      ],
      details,
    },
  ],
});

const goal = (team: string, scorer: string, minute: string) => ({
  type: { text: "Goal" },
  clock: { displayValue: minute },
  team: { id: team },
  scoringPlay: true,
  athletesInvolved: [{ shortName: scorer }],
});

describe("parseScoreboard for soccer", () => {
  it("marks games from soccer feeds as soccer", () => {
    const [game] = parseScoreboard({ events: [soccerEvent()] });
    expect(game.sport).toBe("soccer");
  });

  it("leaves football games without a sport", () => {
    const [game] = parseScoreboard({
      events: [{ ...soccerEvent(), uid: "s:20~l:28~e:1" }],
    });
    expect(game.sport).toBeUndefined();
  });

  it("describes the situation with the latest goal", () => {
    const [game] = parseScoreboard({
      events: [
        soccerEvent({
          details: [
            goal("ARS", "B. Saka", "12'"),
            { type: { text: "Yellow Card" }, scoringPlay: false },
            goal("CHE", "C. Palmer", "58'"),
          ],
        }),
      ],
    });
    expect(game.situation).toBe("CHE - Goal · C. Palmer 58'");
  });

  it("leaves the situation empty before the first goal", () => {
    const [game] = parseScoreboard({ events: [soccerEvent()] });
    expect(game.situation).toBe("");
  });
});

const scoreboardWithCalendar = (calendar: unknown[]) => ({
  leagues: [
    {
      season: { displayName: "2026-27 English Premier League" },
      calendar,
    },
  ],
  events: [],
});

const stage = (startDate: string, endDate: string) => ({
  startDate,
  endDate,
});

describe("parseMonthCalendar", () => {
  const now = new Date("2026-11-15T12:00:00");

  it("lists each month holding a match day, skipping months without one", () => {
    const calendar = parseMonthCalendar(
      scoreboardWithCalendar([
        "2026-08-21T07:00Z",
        "2026-08-22T07:00Z",
        "2026-10-03T07:00Z",
      ]),
      now,
    );
    expect(calendar.weeks.map((week) => week.id)).toEqual([
      "2026-08",
      "2026-10",
    ]);
  });

  it("labels months with their year and groups them by season", () => {
    const [week] = parseMonthCalendar(
      scoreboardWithCalendar(["2026-08-21T07:00Z"]),
      now,
    ).weeks;
    expect(week).toMatchObject({
      label: expect.stringContaining("2026"),
      group: "2026-27 English Premier League",
      year: 2026,
      number: 8,
    });
  });

  it("covers every month of a stage's date range", () => {
    const calendar = parseMonthCalendar(
      scoreboardWithCalendar([
        {
          entries: [stage("2026-09-01T07:00Z", "2026-11-02T07:59Z")],
        },
      ]),
      now,
    );
    expect(calendar.weeks.map((week) => week.id)).toEqual([
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
  });

  it("ends a stage on the day before ESPN's next-morning end time", () => {
    const calendar = parseMonthCalendar(
      scoreboardWithCalendar([
        { entries: [stage("2027-06-01T07:00Z", "2027-07-01T06:59Z")] },
      ]),
      now,
    );
    expect(calendar.weeks.map((week) => week.id)).toEqual(["2027-06"]);
  });

  it("makes this month current", () => {
    const calendar = parseMonthCalendar(
      scoreboardWithCalendar(["2026-10-03T07:00Z", "2026-11-21T07:00Z"]),
      now,
    );
    expect(calendar.currentWeekId).toBe("2026-11");
  });

  it("makes the next month with matches current when this month has none", () => {
    const calendar = parseMonthCalendar(
      scoreboardWithCalendar(["2026-10-03T07:00Z", "2026-12-05T07:00Z"]),
      now,
    );
    expect(calendar.currentWeekId).toBe("2026-12");
  });

  it("makes the last month current after the season ends", () => {
    const calendar = parseMonthCalendar(
      scoreboardWithCalendar(["2026-08-21T07:00Z", "2026-09-12T07:00Z"]),
      now,
    );
    expect(calendar.currentWeekId).toBe("2026-09");
  });

  it("returns no months without a calendar", () => {
    expect(parseMonthCalendar({}, now)).toEqual({ weeks: [] });
  });
});

describe("espnSource for soccer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const stubFetch = () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(
        async () => new Response(JSON.stringify(scoreboardWithCalendar([]))),
      );
    vi.stubGlobal("fetch", fetcher);

    return fetcher;
  };

  const requestedUrl = (fetcher: ReturnType<typeof stubFetch>) =>
    new URL(String(fetcher.mock.calls[0][0]));

  it("requests the Premier League feed for the month chosen", async () => {
    const fetcher = stubFetch();
    await espnSource.load(
      {
        division: "epl",
        week: {
          id: "2026-11",
          label: "November 2026",
          group: "",
          detail: "",
          year: 2026,
          seasonType: 0,
          number: 11,
        },
      },
      new AbortController().signal,
    );
    const url = requestedUrl(fetcher);
    expect(url.pathname).toContain("/soccer/eng.1/scoreboard");
    expect(url.searchParams.get("dates")).toBe("202611");
  });

  it("requests this month's Champions League matches without a chosen month", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-03-10T12:00:00"));
    const fetcher = stubFetch();
    await espnSource.load(
      { division: "ucl", week: null },
      new AbortController().signal,
    );
    const url = requestedUrl(fetcher);
    expect(url.pathname).toContain("/soccer/uefa.champions/scoreboard");
    expect(url.searchParams.get("dates")).toBe("202703");
  });

  it("sends no college group filter to soccer feeds", async () => {
    const fetcher = stubFetch();
    await espnSource.load(
      { division: "epl", week: null },
      new AbortController().signal,
    );
    expect(requestedUrl(fetcher).searchParams.has("groups")).toBe(false);
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";

import { copy } from "@/copy";
import {
  calendarMatchDays,
  espnSource,
  parseMatchweekCalendar,
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

type CalendarOptions = {
  calendar?: unknown[];
  events?: unknown[];
  season?: object;
};

const scoreboardWith = ({
  calendar = [],
  events = [],
  season = {
    displayName: "2026-27 English Premier League",
    startDate: "2026-06-01T04:00Z",
    endDate: "2027-06-01T03:59Z",
  },
}: CalendarOptions = {}) => ({
  leagues: [{ season, calendar }],
  events,
});

const stage = (label: string, startDate: string, endDate: string) => ({
  label,
  startDate,
  endDate,
});

// The Champions League lists stages, not days.
const championsLeagueCalendar = [
  {
    entries: [
      stage("League Phase", "2026-08-27T07:00Z", "2027-02-15T07:59Z"),
      stage("Round of 16", "2027-03-08T08:00Z", "2027-04-05T06:59Z"),
    ],
  },
];

describe("parseMatchweekCalendar", () => {
  const now = new Date("2026-11-15T12:00:00Z");

  const weeksFor = (days: string[], calendar: unknown[] = days) =>
    parseMatchweekCalendar(scoreboardWith({ calendar }), days, now).weeks;

  it("puts match days from Tuesday to Monday in one week", () => {
    const weeks = weeksFor([
      "2026-11-10T19:00Z",
      "2026-11-14T15:00Z",
      "2026-11-16T20:00Z",
    ]);
    expect(weeks.map((week) => week.id)).toEqual(["2026-11-10"]);
  });

  it("starts a new week on Tuesday", () => {
    const weeks = weeksFor(["2026-11-16T20:00Z", "2026-11-17T19:00Z"]);
    expect(weeks.map((week) => week.id)).toEqual(["2026-11-10", "2026-11-17"]);
  });

  it("skips weeks without matches", () => {
    const weeks = weeksFor(["2026-11-07T15:00Z", "2026-11-21T15:00Z"]);
    expect(weeks.map((week) => week.number)).toEqual([1, 2]);
  });

  it("labels a week like football's, with its number and dates", () => {
    const [week] = weeksFor(["2026-11-14T15:00Z"]);
    expect(week).toMatchObject({
      label: copy.week.matchweek(1),
      detail: expect.stringMatching(/^\D+ 10-16$/),
      start: "2026-11-10",
    });
  });

  it("names both months for a week that spans two", () => {
    const [week] = weeksFor(["2026-10-31T15:00Z"]);
    expect(week.detail).toMatch(/^\D+ 27-\D+ 2$/);
  });

  it("groups Premier League weeks under the season", () => {
    const [week] = weeksFor(["2026-11-14T15:00Z"]);
    expect(week.group).toBe("2026-27 English Premier League");
  });

  it("groups Champions League weeks by stage and numbers each stage from 1", () => {
    const weeks = weeksFor(
      ["2026-11-25T20:00Z", "2026-12-09T20:00Z", "2027-03-10T20:00Z"],
      championsLeagueCalendar,
    );
    expect(weeks.map((week) => [week.group, week.number])).toEqual([
      ["League Phase", 1],
      ["League Phase", 2],
      ["Round of 16", 1],
    ]);
  });

  it("leaves out matches from another season", () => {
    const weeks = weeksFor(["2026-03-10T20:00Z", "2026-11-25T20:00Z"]);
    expect(weeks.map((week) => week.id)).toEqual(["2026-11-24"]);
  });

  it("makes this week current", () => {
    const calendar = parseMatchweekCalendar(
      scoreboardWith(),
      ["2026-11-07T15:00Z", "2026-11-14T15:00Z"],
      now,
    );
    expect(calendar.currentWeekId).toBe("2026-11-10");
  });

  it("makes the next week with matches current during a break", () => {
    const calendar = parseMatchweekCalendar(
      scoreboardWith(),
      ["2026-11-07T15:00Z", "2026-11-21T15:00Z"],
      now,
    );
    expect(calendar.currentWeekId).toBe("2026-11-17");
  });

  it("makes the last week current after the season ends", () => {
    const calendar = parseMatchweekCalendar(
      scoreboardWith(),
      ["2026-09-12T15:00Z"],
      now,
    );
    expect(calendar.currentWeekId).toBe("2026-09-08");
  });

  it("returns no weeks without match days", () => {
    expect(parseMatchweekCalendar(scoreboardWith(), [], now).weeks).toEqual([]);
  });
});

describe("calendarMatchDays", () => {
  it("reads the Premier League's listed match days", () => {
    expect(
      calendarMatchDays(scoreboardWith({ calendar: ["2026-11-14T07:00Z"] })),
    ).toEqual(["2026-11-14T07:00Z"]);
  });

  it("finds none in the Champions League's stage list", () => {
    expect(
      calendarMatchDays(scoreboardWith({ calendar: championsLeagueCalendar })),
    ).toEqual([]);
  });
});

const event = (id: string, date: string) => ({
  ...soccerEvent(),
  id,
  date,
});

const week = (start: string) => ({
  id: start,
  label: copy.week.matchweek(1),
  group: "",
  detail: "",
  year: 2026,
  seasonType: 1,
  number: 1,
  start,
});

describe("espnSource for soccer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  const stubFetch = (body: object = scoreboardWith()) => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation(async () => new Response(JSON.stringify(body)));
    vi.stubGlobal("fetch", fetcher);

    return fetcher;
  };

  const requestedUrls = (fetcher: ReturnType<typeof stubFetch>) =>
    fetcher.mock.calls.map(([url]) => new URL(String(url)));

  it("requests the month holding the chosen week", async () => {
    const fetcher = stubFetch();
    await espnSource.load(
      { division: "epl", week: week("2026-11-10") },
      new AbortController().signal,
    );
    const [url] = requestedUrls(fetcher);
    expect(url.pathname).toContain("/soccer/eng.1/scoreboard");
    expect(url.searchParams.get("dates")).toBe("202611");
  });

  it("requests both months of a week that spans two", async () => {
    const fetcher = stubFetch();
    await espnSource.load(
      { division: "epl", week: week("2026-10-27") },
      new AbortController().signal,
    );
    expect(
      requestedUrls(fetcher).map((url) => url.searchParams.get("dates")),
    ).toEqual(["202610", "202611"]);
  });

  it("returns only the chosen week's matches", async () => {
    stubFetch(
      scoreboardWith({
        events: [
          event("before", "2026-11-09T20:00Z"),
          event("in", "2026-11-14T15:00Z"),
          event("after", "2026-11-17T19:00Z"),
        ],
      }),
    );
    const games = await espnSource.load(
      { division: "epl", week: week("2026-11-10") },
      new AbortController().signal,
    );
    expect(games.map((game) => game.id)).toEqual(["in"]);
  });

  it("loads this week's Champions League matches without a chosen week", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2027-03-10T12:00:00Z"));
    const fetcher = stubFetch();
    await espnSource.load(
      { division: "ucl", week: null },
      new AbortController().signal,
    );
    const [url] = requestedUrls(fetcher);
    expect(url.pathname).toContain("/soccer/uefa.champions/scoreboard");
    expect(url.searchParams.get("dates")).toBe("202703");
  });

  it("sends no college group filter to soccer feeds", async () => {
    const fetcher = stubFetch();
    await espnSource.load(
      { division: "epl", week: null },
      new AbortController().signal,
    );
    expect(requestedUrls(fetcher)[0].searchParams.has("groups")).toBe(false);
  });

  it("finds Champions League match days from the season's years", async () => {
    const fetcher = stubFetch(
      scoreboardWith({
        calendar: championsLeagueCalendar,
        season: {
          startDate: "2026-07-01T04:00Z",
          endDate: "2027-07-01T03:59Z",
        },
        events: [event("1", "2026-11-25T20:00Z")],
      }),
    );
    const calendar = await espnSource.loadCalendar(
      "ucl",
      new AbortController().signal,
    );
    expect(
      requestedUrls(fetcher)
        .slice(1)
        .map((url) => url.searchParams.get("dates")),
    ).toEqual(["2026", "2027"]);
    expect(calendar.weeks.map((week) => week.id)).toEqual(["2026-11-24"]);
  });
});

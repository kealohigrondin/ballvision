import { afterEach, describe, expect, it, vi } from "vitest";

import {
  espnLeagueSource,
  espnSource,
  parseCalendar,
  parseScoreboard,
} from "../src/data/espn";

const competitor = (id: string, homeAway: string) => ({
  id,
  homeAway,
  score: "14",
  team: { shortDisplayName: id, abbreviation: id, color: "112233" },
  curatedRank: { current: 99 },
  linescores: [{ value: 7, displayValue: "7" }],
});

const event = (id: string, state: string, extra = {}) => ({
  id,
  date: "2026-10-31T19:00:00Z",
  status: {
    period: 2,
    displayClock: "3:42",
    type: { state, name: "STATUS_SCHEDULED", ...extra },
  },
  competitions: [
    {
      competitors: [competitor("HOME", "home"), competitor("AWAY", "away")],
      situation: {
        possession: "AWAY",
        downDistanceText: "3rd & 4",
        lastPlay: { text: "Pass complete." },
      },
    },
  ],
});
describe("ESPN adapter", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses NFL feeds without college group filters or polls", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: [event("nfl", "pre")] }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ children: [] }),
      });
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    const games = await espnSource.load(
      { week: null, division: "nfl" },
      signal,
    );
    const scoreUrl = fetchMock.mock.calls[0][0] as URL;
    expect(scoreUrl.pathname).toContain("/nfl/scoreboard");
    expect(scoreUrl.searchParams.has("groups")).toBe(false);
    expect(scoreUrl.searchParams.has("week")).toBe(false);
    expect(scoreUrl.searchParams.has("dates")).toBe(false);
    expect(games[0].state).toBe("upcoming");
    await espnLeagueSource.loadStandings("nfl", signal);
    const standingsUrls = fetchMock.mock.calls
      .slice(1)
      .map(([url]) => new URL(String(url)));
    expect(standingsUrls.every((url) => url.pathname.includes("/nfl/"))).toBe(
      true,
    );
    expect(standingsUrls.map((url) => url.searchParams.get("level"))).toEqual([
      "2",
      "3",
    ]);
    expect(standingsUrls.some((url) => url.searchParams.has("group"))).toBe(
      false,
    );
    expect(await espnLeagueSource.loadRankings("nfl", signal)).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("requests the full daily slate using ESPN's working 100-game limit", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ events: [event("scheduled", "pre")] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    const games = await espnSource.load(
      {
        week: {
          id: "2026-2-10",
          label: "Week 10",
          group: "Regular Season",
          detail: "",
          year: 2026,
          seasonType: 2,
          number: 10,
        },
        division: "fbs",
      },
      signal,
    );
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.searchParams.get("limit")).toBe("100");
    expect(url.searchParams.get("dates")).toBe("2026");
    expect(url.searchParams.get("seasontype")).toBe("2");
    expect(url.searchParams.get("week")).toBe("10");
    expect(url.searchParams.get("groups")).toBe("80");
    expect(options.signal).toBe(signal);
    expect(games[0].state).toBe("upcoming");
  });
  it("normalizes game situation, team orientation, and score by period", () => {
    const [g] = parseScoreboard({ events: [event("1", "in")] });
    expect(g).toMatchObject({
      state: "live",
      clock: "3:42",
      period: 2,
      possession: "AWAY",
      situation: "3rd & 4",
      lastPlay: "Pass complete.",
    });
    expect(g.home.name).toBe("HOME");
    expect(g.away.name).toBe("AWAY");
    expect(g.home.rank).toBeUndefined();
    expect(g.home.quarters).toEqual(["7"]);
  });
  it.each(["Extra Point Good", "Field Goal Good"])(
    "shows the team and %s when down-and-distance is unavailable",
    (playType) => {
      const scoringEvent = event("scoring", "in");
      const competition = {
        ...scoringEvent.competitions[0],
        situation: {
          downDistanceText: "",
          lastPlay: {
            type: { text: playType },
            team: { id: "HOME" },
            text: "Kick is good.",
          },
        },
      };
      const [game] = parseScoreboard({
        events: [{ ...scoringEvent, competitions: [competition] }],
      });
      expect(game.situation).toBe(`HOME - ${playType}`);
      expect(game.lastPlay).toBe("Kick is good.");
    },
  );

  it("sorts live before scheduled and completed games", () => {
    expect(
      parseScoreboard({
        events: [
          event("final", "post"),
          event("scheduled", "pre"),
          event("live", "in"),
        ],
      }).map((g) => g.id),
    ).toEqual(["live", "scheduled", "final"]);
  });
  it("preserves postponed games without describing them as upcoming", () => {
    const [g] = parseScoreboard({
      events: [
        event("1", "pre", { name: "STATUS_POSTPONED", detail: "Postponed" }),
      ],
    });
    expect(g.state).toBe("other");
    expect(g.status).toBe("Postponed");
  });
  it("accepts an empty slate, rejects a broken envelope, and skips incomplete games", () => {
    expect(parseScoreboard({ events: [] })).toEqual([]);
    expect(() => parseScoreboard({ error: "denied" })).toThrow();
    expect(parseScoreboard({ events: [{ id: "bad" }] })).toEqual([]);
  });
  it("lists every calendar week grouped by season type and marks the current week", () => {
    const calendar = parseCalendar({
      season: { year: 2026, type: 2 },
      week: { number: 1 },
      leagues: [
        {
          calendar: [
            {
              label: "Regular Season",
              value: "2",
              entries: [
                { label: "Week 0", value: "0", detail: "Aug 22-24" },
                { label: "Week 1", value: "1", detail: "Aug 25-31" },
                { label: "Broken", value: "" },
              ],
            },
            {
              label: "Postseason",
              value: "3",
              entries: [{ label: "Bowls", value: "1" }],
            },
            { label: "Off Season", value: "4" },
          ],
        },
      ],
    });
    expect(calendar.weeks.map((w) => [w.id, w.label, w.group])).toEqual([
      ["2026-2-0", "Week 0", "Regular Season"],
      ["2026-2-1", "Week 1", "Regular Season"],
      ["2026-3-1", "Bowls", "Postseason"],
    ]);
    expect(calendar.weeks[0].detail).toBe("Aug 22-24");
    expect(calendar.currentWeekId).toBe("2026-2-1");
  });
  it("returns no weeks without a season and ignores an unknown current week", () => {
    expect(parseCalendar({ leagues: [{ calendar: [] }] })).toEqual({
      weeks: [],
    });
    const calendar = parseCalendar({
      season: { year: 2026, type: 4 },
      leagues: [
        {
          calendar: [
            { label: "Regular Season", value: "2", entries: [{ value: "1" }] },
          ],
        },
      ],
    });
    expect(calendar.weeks[0].label).toBe("Week 1");
    expect(calendar.currentWeekId).toBeUndefined();
  });
  it("loads the calendar from a one-game college scoreboard", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ events: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);
    await espnSource.loadCalendar("fcs", new AbortController().signal);
    const url = fetchMock.mock.calls[0][0] as URL;
    expect(url.pathname).toContain("/college-football/scoreboard");
    expect(url.searchParams.get("groups")).toBe("81");
    expect(url.searchParams.get("limit")).toBe("1");
  });
});

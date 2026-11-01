import { describe, expect, it } from "vitest";
import { parseScoreboard } from "../src/data/espn";
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
});

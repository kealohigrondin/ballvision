import { expect, it } from "vitest";

import { copy } from "../src/copy";
import { parseRankings } from "../src/data/espn";
import { rankTrend } from "../src/utils/rankTrend";

const poll = (ranks: { current: number; previous?: number }[]) => ({
  rankings: [
    {
      id: "1",
      name: "AP Top 25",
      ranks: ranks.map(({ current, previous }) => ({
        current,
        ...(previous !== undefined && { previous }),
        team: { id: `team-${current}`, nickname: `Team ${current}` },
      })),
    },
  ],
});

const firstRow = (ranks: { current: number; previous?: number }[]) =>
  parseRankings(poll(ranks), "fbs")[0].rows[0];

it("works out how many places a team moved from its previous rank", () => {
  expect(firstRow([{ current: 3, previous: 7 }]).rankChange).toBe(4);
});

it("marks a team unranked in the previous poll as newly ranked", () => {
  const row = firstRow([{ current: 18, previous: 0 }]);
  expect(row.newlyRanked).toBe(true);
  expect(row.rankChange).toBeUndefined();
});

it("leaves the trend unset when ESPN has no previous rank", () => {
  const row = firstRow([{ current: 1 }]);
  expect(row.rankChange).toBeUndefined();
  expect(row.newlyRanked).toBeUndefined();
});

it("labels a team that moved up with a plus sign", () => {
  expect(rankTrend({ rankChange: 3 })).toEqual({
    label: "+3",
    direction: "up",
  });
});

it("labels a team that moved down with a minus sign", () => {
  expect(rankTrend({ rankChange: -4 })).toEqual({
    label: "-4",
    direction: "down",
  });
});

it("labels an unchanged rank", () => {
  expect(rankTrend({ rankChange: 0 })).toEqual({
    label: copy.league.trendUnchanged,
    direction: "none",
  });
});

it("labels a newly ranked team as new and moving up", () => {
  expect(rankTrend({ newlyRanked: true })).toEqual({
    label: copy.league.trendNew,
    direction: "up",
  });
});

it("labels a team with no previous rank as empty", () => {
  expect(rankTrend({})).toEqual({
    label: copy.common.emptyValue,
    direction: "none",
  });
});

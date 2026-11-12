import { expect, it } from "vitest";

import { parseRankings } from "../src/data/espn";

const poll = (type: string, name: string) => ({
  id: type,
  type,
  name,
  ranks: [
    { current: 1, points: 1500, team: { id: "61", nickname: "Georgia" } },
  ],
});

const rankings = parseRankings(
  {
    rankings: [
      poll("cfp", "Playoff Committee Rankings"),
      poll("ap", "AP Top 25"),
    ],
  },
  "fbs",
);

it("leaves points off the playoff committee rankings", () => {
  const committee = rankings.find((table) => table.id === "cfp");
  expect(committee?.rows[0].points).toBeUndefined();
});

it("keeps voting points on points-based polls", () => {
  const ap = rankings.find((table) => table.id === "ap");
  expect(ap?.rows[0].points).toBe("1500");
});

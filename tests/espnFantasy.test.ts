import { describe, expect, it } from "vitest";

import {
  parseEspnFantasyTeam,
  parseEspnTeamLink,
} from "@/features/fantasy/espnFantasy";

// A roster entry in the shape of ESPN's league roster view.
const entry = (
  id: number,
  fullName: string,
  proTeamId: number,
  defaultPositionId: number,
  lineupSlotId: number,
  stats: unknown[] = [],
) => ({
  lineupSlotId,
  playerPoolEntry: {
    player: { id, fullName, proTeamId, defaultPositionId, stats },
  },
});

const weekStats = (week: number, actual: number, projected: number) => [
  {
    scoringPeriodId: week,
    statSourceId: 0,
    statSplitTypeId: 1,
    appliedTotal: actual,
  },
  {
    scoringPeriodId: week,
    statSourceId: 1,
    statSplitTypeId: 1,
    appliedTotal: projected,
  },
  {
    scoringPeriodId: 0,
    statSourceId: 0,
    statSplitTypeId: 0,
    appliedTotal: 140.2,
  },
];

const payload = {
  id: 899513,
  settings: { name: "Sunday Scaries" },
  teams: [
    {
      id: 4,
      roster: {
        entries: [
          entry(1, "Bench Back", 2, 2, 20),
          entry(2, "Starting Quarterback", 28, 1, 0, weekStats(10, 21.4, 18)),
          entry(3, "Free Agent", 0, 3, 4),
          entry(4, "Hurt Receiver", 26, 3, 21),
          entry(5, "Defense", 33, 16, 16),
        ],
      },
    },
    { id: 5, roster: { entries: [entry(9, "Rival Player", 1, 2, 2)] } },
  ],
};

describe("parseEspnTeamLink", () => {
  it("reads the league and team ids from a team page link", () => {
    expect(
      parseEspnTeamLink(
        "https://fantasy.espn.com/football/team?leagueId=899513&teamId=4&seasonId=2026",
      ),
    ).toEqual({ leagueId: "899513", teamId: "4" });
  });

  it("ignores spaces around the link", () => {
    expect(
      parseEspnTeamLink(
        "  https://fantasy.espn.com/football/team?leagueId=1&teamId=2 ",
      ),
    ).toEqual({ leagueId: "1", teamId: "2" });
  });

  it("rejects a league link without a team", () => {
    expect(
      parseEspnTeamLink("https://fantasy.espn.com/football/league?leagueId=1"),
    ).toBeUndefined();
  });

  it("rejects text that is not a link", () => {
    expect(parseEspnTeamLink("AaronY")).toBeUndefined();
  });
});

describe("parseEspnFantasyTeam", () => {
  const team = () => parseEspnFantasyTeam(payload, "4", 10);

  it("names the league after ESPN's league name", () => {
    expect(team()?.name).toBe("Sunday Scaries");
  });

  it("lists only the linked team's players", () => {
    expect(team()?.players.map((player) => player.id)).not.toContain("9");
  });

  it("puts starters before bench and injured reserve players", () => {
    expect(team()?.players.map((player) => player.starter)).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });

  it("uses the scoreboard's NFL team abbreviations", () => {
    expect(team()?.players[0].team).toBe("WSH");
  });

  it("names each player's position", () => {
    expect(team()?.players.map((player) => player.position)).toEqual([
      "QB",
      "D/ST",
      "RB",
      "WR",
    ]);
  });

  it("uses the week's actual points, not the projection", () => {
    expect(team()?.players[0].points).toBe(21.4);
  });

  it("gives a player who hasn't played this week 0 points", () => {
    expect(team()?.players[1].points).toBe(0);
  });

  it("leaves out free agents with no NFL team", () => {
    expect(team()?.players.map((player) => player.name)).not.toContain(
      "Free Agent",
    );
  });

  it("finds nothing for a team that isn't in the league", () => {
    expect(parseEspnFantasyTeam(payload, "99", 10)).toBeUndefined();
  });
});

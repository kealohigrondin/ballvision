import { describe, expect, it } from "vitest";

import {
  headshotThumbnail,
  parseGameSummary,
  parseScoringPlays,
  parseTeamLeaders,
  parseTeamStats,
} from "@/features/scores/espnGameSummary";
import { splitStatLine } from "@/features/scores/statLine";

// One ESPN leader category, shaped like the summary's leaders[].leaders[].
const category = (name: string, displayValue: string, shortName: string) => ({
  name,
  leaders: [
    {
      displayValue,
      athlete: {
        id: shortName,
        shortName,
        jersey: "14",
        position: { abbreviation: "QB" },
        headshot: {
          href: "https://a.espncdn.com/i/headshots/college-football/players/full/1.png",
        },
      },
    },
  ],
});

const uga = {
  team: { id: "61", abbreviation: "UGA" },
  leaders: [
    category("receivingYards", "6 REC, 85 YDS", "C. Dandridge"),
    category("passingYards", "18/24, 252 YDS, 1 TD", "G. Stockton"),
    category("totalTackles", "10", "J. Williams"),
  ],
};

// Box score stats as ESPN lists them for one team.
const boxTeam = (id: string, stats: Record<string, string>) => ({
  team: { id },
  statistics: Object.entries(stats).map(([name, displayValue]) => ({
    name,
    displayValue,
  })),
});

const boxscore = {
  boxscore: {
    teams: [
      boxTeam("142", {
        totalYards: "275",
        turnovers: "1",
        firstDowns: "14",
        totalPenaltiesYards: "1-15",
        thirdDownEff: "2-10",
        fourthDownEff: "1-1",
        possessionTime: "27:13",
      }),
      boxTeam("61", {
        totalYards: "468",
        turnovers: "1",
        firstDowns: "23",
        totalPenaltiesYards: "3-25",
        thirdDownEff: "4-9",
        fourthDownEff: "0-0",
        possessionTime: "30:51",
      }),
    ],
  },
};

const stat = (key: string) =>
  parseTeamStats(boxscore, "142", "61").find((line) => line.key === key);

describe("parseTeamLeaders", () => {
  it("keeps passing, rushing and receiving leaders in that order", () => {
    expect(parseTeamLeaders(uga).map(({ category }) => category)).toEqual([
      "passing",
      "receiving",
    ]);
  });

  it("tags each leader with the team's abbreviation", () => {
    expect(parseTeamLeaders(uga)[0].team).toBe("UGA");
  });

  it("reads the summary's nested headshot URL", () => {
    expect(parseTeamLeaders(uga)[0].headshot).toBe(
      headshotThumbnail(
        "https://a.espncdn.com/i/headshots/college-football/players/full/1.png",
      ),
    );
  });
});

describe("parseTeamStats", () => {
  it("lists the stats in display order", () => {
    expect(parseTeamStats(boxscore, "142", "61").map(({ key }) => key)).toEqual(
      [
        "totalYards",
        "turnovers",
        "firstDowns",
        "penalties",
        "thirdDown",
        "fourthDown",
        "possession",
      ],
    );
  });

  it("shows third downs as made over attempts", () => {
    expect(stat("thirdDown")).toMatchObject({ away: "2/10", home: "4/9" });
  });

  it("compares third downs by conversion rate", () => {
    expect(stat("thirdDown")?.homeValue).toBeCloseTo(4 / 9);
  });

  it("compares a conversion with no attempts as zero", () => {
    expect(stat("fourthDown")?.homeValue).toBe(0);
  });

  it("compares penalties by yards", () => {
    expect(stat("penalties")).toMatchObject({ awayValue: 15, homeValue: 25 });
  });

  it("compares possession by seconds", () => {
    expect(stat("possession")?.awayValue).toBe(27 * 60 + 13);
  });

  it("returns no stats when a team is missing from the box score", () => {
    expect(parseTeamStats(boxscore, "142", "999")).toEqual([]);
  });
});

describe("parseGameSummary", () => {
  it("puts each team's leaders on its side", () => {
    const summary = parseGameSummary({ leaders: [uga] }, "142", "61");
    expect(summary.leaders.home.map(({ name }) => name)).toEqual([
      "G. Stockton",
      "C. Dandridge",
    ]);
  });

  it("gives a team without a leaders group no leaders", () => {
    expect(
      parseGameSummary({ leaders: [uga] }, "142", "61").leaders.away,
    ).toEqual([]);
  });
});

// ESPN's scoring play shape, trimmed to the fields the app reads.
const espnScoringPlay = (
  id: string,
  teamId: string,
  awayScore: number,
  homeScore: number,
) => ({
  id,
  text: "John Mateer 8 Yd Run (Tate Sandell Kick)",
  awayScore,
  homeScore,
  period: { number: 1 },
  clock: { displayValue: "5:54" },
  team: { id: teamId },
  type: { abbreviation: "TD" },
  scoringType: { abbreviation: "TD" },
});

describe("parseScoringPlays", () => {
  it("keeps both teams' plays in the order they happened", () => {
    const plays = parseScoringPlays(
      {
        scoringPlays: [
          espnScoringPlay("a", "201", 0, 7),
          espnScoringPlay("b", "145", 7, 7),
        ],
      },
      "145",
      "201",
    );
    expect(plays.map((play) => [play.id, play.side])).toEqual([
      ["a", "home"],
      ["b", "away"],
    ]);
  });

  it("reads the quarter, clock, type, description and score", () => {
    const [play] = parseScoringPlays(
      { scoringPlays: [espnScoringPlay("a", "201", 0, 7)] },
      "145",
      "201",
    );
    expect(play).toEqual({
      id: "a",
      side: "home",
      period: 1,
      clock: "5:54",
      type: "TD",
      text: "John Mateer 8 Yd Run (Tate Sandell Kick)",
      awayScore: 0,
      homeScore: 7,
    });
  });

  it("skips a play by a team that is not in the game", () => {
    const plays = parseScoringPlays(
      { scoringPlays: [espnScoringPlay("a", "999", 0, 7)] },
      "145",
      "201",
    );
    expect(plays).toEqual([]);
  });

  it("returns no plays when the summary has none", () => {
    expect(parseScoringPlays({}, "145", "201")).toEqual([]);
  });
});

describe("headshotThumbnail", () => {
  it("ignores images that are not ESPN headshots", () => {
    expect(headshotThumbnail("https://example.com/face.png")).toBeUndefined();
  });
});

describe("splitStatLine", () => {
  it("separates numbers from labels", () => {
    expect(splitStatLine("8/9, 60 YDS").map(({ value }) => value)).toEqual([
      true,
      false,
      true,
      false,
    ]);
  });
});

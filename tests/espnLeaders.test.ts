import { describe, expect, it } from "vitest";

import {
  headshotThumbnail,
  parseGameLeaders,
  withGameLeaders,
} from "@/features/scores/espnLeaders";
import { splitStatLine } from "@/features/scores/statLine";
import type { Game, GameState, Team } from "@/shared/types";

const team = (id: string, abbreviation: string): Team => ({
  id,
  name: abbreviation,
  abbreviation,
  color: "#000000",
  score: "0",
  quarters: [],
});

const game = (state: GameState = "live"): Game => ({
  id: "401",
  away: team("150", "DUKE"),
  home: team("2390", "MIA"),
  state,
  status: "",
  clock: "",
  period: 1,
  start: "2026-11-14T00:00:00Z",
  broadcast: "",
  venue: "",
  situation: "",
  lastPlay: "",
  redZone: false,
});

// One ESPN leader entry, shaped like the scoreboard's competition.leaders.
const leaderGroup = (
  name: string,
  displayValue: string,
  athlete: Record<string, unknown>,
) => ({
  name,
  leaders: [{ displayValue, athlete, team: { id: athlete.teamId } }],
});

const mensah = {
  id: "5141561",
  shortName: "D. Mensah",
  jersey: "10",
  position: { abbreviation: "QB" },
  headshot:
    "https://a.espncdn.com/i/headshots/college-football/players/full/5141561.png",
  teamId: "2390",
};

const competition = {
  leaders: [
    leaderGroup("receivingYards", "3 REC, 20 YDS", {
      ...mensah,
      shortName: "E. Lofton",
      position: { abbreviation: "TE" },
    }),
    leaderGroup("passingYards", "8/9, 60 YDS", mensah),
    leaderGroup("rushingYards", "3 CAR, 12 YDS", {
      ...mensah,
      shortName: "N. Sheppard",
      teamId: "150",
    }),
  ],
};

describe("parseGameLeaders", () => {
  it("orders leaders as passing, rushing, then receiving", () => {
    expect(
      parseGameLeaders(competition, game()).map(({ category }) => category),
    ).toEqual(["passing", "rushing", "receiving"]);
  });

  it("reads the player's name, position, number and stats", () => {
    expect(parseGameLeaders(competition, game())[0]).toMatchObject({
      name: "D. Mensah",
      position: "QB",
      jersey: "10",
      stats: "8/9, 60 YDS",
    });
  });

  it("names the player's team by its abbreviation in this game", () => {
    expect(parseGameLeaders(competition, game())[1].team).toBe("DUKE");
  });

  it("skips a category with no leader", () => {
    expect(
      parseGameLeaders(
        { leaders: [{ name: "passingYards", leaders: [] }] },
        game(),
      ),
    ).toEqual([]);
  });
});

describe("headshotThumbnail", () => {
  it("asks ESPN's image service for a small copy of a headshot", () => {
    expect(headshotThumbnail(mensah.headshot)).toBe(
      "https://a.espncdn.com/combiner/i?img=/i/headshots/college-football/players/full/5141561.png&w=96&h=70",
    );
  });

  it("ignores images that are not ESPN headshots", () => {
    expect(headshotThumbnail("https://example.com/face.png")).toBeUndefined();
  });
});

describe("withGameLeaders", () => {
  const payload = { events: [{ id: "401", competitions: [competition] }] };

  it("adds leaders to a game in progress", () => {
    expect(withGameLeaders(payload, [game("live")])[0].leaders).toHaveLength(3);
  });

  it("adds leaders to a finished game", () => {
    expect(withGameLeaders(payload, [game("final")])[0].leaders).toHaveLength(
      3,
    );
  });

  it("leaves season leaders off upcoming games", () => {
    expect(
      withGameLeaders(payload, [game("upcoming")])[0].leaders,
    ).toBeUndefined();
  });
});

describe("splitStatLine", () => {
  it("separates numbers from labels", () => {
    expect(splitStatLine("8/9, 60 YDS")).toEqual([
      { text: "8/9", value: true },
      { text: ", ", value: false },
      { text: "60", value: true },
      { text: " YDS", value: false },
    ]);
  });

  it("keeps a decimal number whole", () => {
    expect(splitStatLine("4.3 AVG")[0]).toEqual({ text: "4.3", value: true });
  });
});

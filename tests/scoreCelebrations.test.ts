import { describe, expect, it } from "vitest";
import {
  celebrationSoundKind,
  baselineScores,
  detectScoreChanges,
} from "../src/utils/scoreCelebrations";
import { oddsGame } from "./helpers/oddsFixture";
import type { Game } from "../src/data/types";
const game = (
  home: string,
  away = "0",
  state: Game["state"] = "live",
): Game => ({
  ...oddsGame,
  state,
  home: { ...oddsGame.home, score: home },
  away: { ...oddsGame.away, score: away },
});

describe("live score detection", () => {
  it("ignores unchanged scores and newly appearing games", () => {
    const initial = game("7");
    expect(
      detectScoreChanges(baselineScores([initial]), [initial], "slate")
        .celebrations,
    ).toEqual([]);
    expect(
      detectScoreChanges(new Map(), [initial], "slate").celebrations,
    ).toEqual([]);
  });
  it("detects a live increase with the new score snapshot", () => {
    const result = detectScoreChanges(
      baselineScores([game("0")]),
      [game("7")],
      "slate",
    );
    expect(result.celebrations[0]).toMatchObject({
      points: 7,
      scoringTeamIds: [oddsGame.home.id],
      game: { home: { score: "7" } },
      preview: false,
    });
  });
  it("ignores decreases and repeated scores after a correction", () => {
    const correction = detectScoreChanges(
      baselineScores([game("7")]),
      [game("0")],
      "slate",
    );
    expect(correction.celebrations).toEqual([]);
    expect(
      detectScoreChanges(correction.snapshots, [game("7")], "slate")
        .celebrations,
    ).toEqual([]);
    expect(
      detectScoreChanges(correction.snapshots, [game("10")], "slate")
        .celebrations,
    ).toHaveLength(1);
  });
  it("captures scoring on the final live update but ignores revisions to already-final games", () => {
    expect(
      detectScoreChanges(
        baselineScores([game("7")]),
        [game("10", "0", "final")],
        "slate",
      ).celebrations,
    ).toHaveLength(1);
    expect(
      detectScoreChanges(
        baselineScores([game("7", "0", "final")]),
        [game("10", "0", "final")],
        "slate",
      ).celebrations,
    ).toEqual([]);
  });
  it("reports both teams if both scored between refreshes", () => {
    const result = detectScoreChanges(
      baselineScores([game("0")]),
      [game("7", "3")],
      "slate",
    );
    expect(result.celebrations[0].scoringTeamIds).toEqual([
      oddsGame.home.id,
      oddsGame.away.id,
    ]);
  });
  it("does not treat unavailable scores becoming valid as scoring", () => {
    const missing = detectScoreChanges(
      baselineScores([game("—")]),
      [game("—")],
      "slate",
    );
    expect(
      detectScoreChanges(missing.snapshots, [game("7")], "slate").celebrations,
    ).toEqual([]);
  });
});

describe("score sound rules", () => {
  it.each([
    ["7", "6", 1, false, 1, "sixSeven"],
    ["6", "7", 6, false, 1, "sixSeven"],
    ["6", "7", 3, false, 1, "sixSeven"],
    ["10", "7", 3, false, 1, "fieldGoal"],
    ["7", "0", 1, false, 1, "pat"],
    ["7", "0", 7, false, 1, "score"],
    ["6", "7", 0, true, 1, "score"],
    ["10", "7", 3, false, 2, "score"],
    ["67", "0", 7, false, 1, "score"],
  ])(
    "selects %s–%s (+%i, preview=%s, teams=%i) as %s",
    (home, away, points, preview, teams, expected) => {
      expect(
        celebrationSoundKind({
          id: "event",
          game: game(home, away),
          points,
          preview,
          scoringTeamIds: ["home", "away"].slice(0, teams),
        }),
      ).toBe(expected);
    },
  );
});

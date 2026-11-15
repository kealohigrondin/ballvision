import { describe, expect, it } from "vitest";

import {
  baselineScores,
  detectScoreChanges,
  notificationSoundKind,
} from "@/features/notifications/scoreNotifications";
import type { Game } from "@/shared/types";

import { oddsGame } from "./helpers/oddsFixture";

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
        .notifications,
    ).toEqual([]);
    expect(
      detectScoreChanges(new Map(), [initial], "slate").notifications,
    ).toEqual([]);
  });
  it("detects a live increase with the new score snapshot", () => {
    const result = detectScoreChanges(
      baselineScores([game("0")]),
      [game("7")],
      "slate",
    );
    expect(result.notifications[0]).toMatchObject({
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
    expect(correction.notifications).toEqual([]);
    expect(
      detectScoreChanges(correction.snapshots, [game("7")], "slate")
        .notifications,
    ).toEqual([]);
    expect(
      detectScoreChanges(correction.snapshots, [game("10")], "slate")
        .notifications,
    ).toHaveLength(1);
  });
  it("captures scoring on the final live update but ignores revisions to already-final games", () => {
    expect(
      detectScoreChanges(
        baselineScores([game("7")]),
        [game("10", "0", "final")],
        "slate",
      ).notifications,
    ).toHaveLength(1);
    expect(
      detectScoreChanges(
        baselineScores([game("7", "0", "final")]),
        [game("10", "0", "final")],
        "slate",
      ).notifications,
    ).toEqual([]);
  });
  it("reports both teams if both scored between refreshes", () => {
    const result = detectScoreChanges(
      baselineScores([game("0")]),
      [game("7", "3")],
      "slate",
    );
    expect(result.notifications[0].scoringTeamIds).toEqual([
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
      detectScoreChanges(missing.snapshots, [game("7")], "slate").notifications,
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
        notificationSoundKind({
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

describe("Tennessee score sound", () => {
  it.each([
    ["home", 7, "0", "7"],
    ["away", 6, "7", "6"],
    ["home", 3, "7", "6"],
    ["away", 1, "6", "7"],
  ] as const)(
    "prioritizes Rocky Top for a %s Tennessee score worth %i",
    (side, points, homeScore, awayScore) => {
      const eventGame = game(homeScore, awayScore);
      eventGame[side] = {
        ...eventGame[side],
        name: "Tennessee",
        abbreviation: "TENN",
      };
      expect(
        notificationSoundKind({
          id: "event",
          game: eventGame,
          scoringTeamIds: [eventGame[side].id],
          points,
          preview: false,
        }),
      ).toBe("tennessee_td");
    },
  );
  it("does not use Rocky Top for an opponent score, preview, or another Tennessee team", () => {
    const eventGame = {
      ...game("7", "0"),
      home: { ...game("7").home, name: "Tennessee", abbreviation: "TENN" },
    };
    const event = {
      id: "event",
      game: eventGame,
      scoringTeamIds: [eventGame.away.id],
      points: 7,
      preview: false,
    };
    expect(notificationSoundKind(event)).toBe("score");
    expect(
      notificationSoundKind({
        ...event,
        scoringTeamIds: [eventGame.home.id],
        preview: true,
      }),
    ).toBe("score");
    for (const team of [
      { name: "Tennessee State", abbreviation: "TNST" },
      { name: "Titans", location: "Tennessee", abbreviation: "TEN" },
    ]) {
      expect(
        notificationSoundKind({
          ...event,
          scoringTeamIds: [eventGame.home.id],
          game: { ...eventGame, home: { ...eventGame.home, ...team } },
        }),
      ).toBe("score");
    }
    expect(
      notificationSoundKind({
        ...event,
        scoringTeamIds: [eventGame.home.id, eventGame.away.id],
      }),
    ).toBe("tennessee_td");
  });
});

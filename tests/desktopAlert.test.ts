import { afterEach, expect, it, vi } from "vitest";

import { copy } from "@/copy";
import { desktopAlert } from "@/features/notifications/desktopAlert";
import { pageInBackground } from "@/features/notifications/desktopNotifier";
import type { ScoreNotification } from "@/features/notifications/scoreNotifications";
import { gameTime } from "@/shared/gameTime";

import { oddsGame } from "./helpers/oddsFixture";

afterEach(() => vi.restoreAllMocks());

const touchdown = (
  overrides: Partial<ScoreNotification> = {},
): ScoreNotification => ({
  id: "slate:game-1:7:0",
  game: {
    ...oddsGame,
    away: { ...oddsGame.away, logo: "https://example.test/psu.png" },
  },
  scoringTeamIds: [oddsGame.away.id],
  points: 7,
  preview: false,
  ...overrides,
});

it("states both teams' scores and the game clock", () => {
  expect(desktopAlert(touchdown()).body).toBe(
    copy.scoreNotification.desktopBody(
      "Penn St 7",
      "Washington 0",
      gameTime(oddsGame),
    ),
  );
});

it("shows the scoring team's logo", () => {
  expect(desktopAlert(touchdown()).icon).toBe("https://example.test/psu.png");
});

it("leaves the icon out when the scoring team has no logo", () => {
  expect(
    desktopAlert(touchdown({ scoringTeamIds: [oddsGame.home.id] })).icon,
  ).toBeUndefined();
});

it("tags alerts by game so a newer score replaces an older one", () => {
  expect(desktopAlert(touchdown()).tag).toBe("ballvision-score-game-1");
});

it("treats a hidden tab as the background", () => {
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  expect(pageInBackground()).toBe(true);
});

it("treats another focused window as the background", () => {
  vi.spyOn(document, "hasFocus").mockReturnValue(false);
  expect(pageInBackground()).toBe(true);
});

it("treats a visible, focused page as the foreground", () => {
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  expect(pageInBackground()).toBe(false);
});

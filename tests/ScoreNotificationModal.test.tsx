import { copy } from "../src/copy";
import { periodLabel } from "../src/utils/gameTime";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AppTheme } from "../src/providers/AppTheme";
import { ScoreNotificationProvider } from "../src/providers/ScoreNotificationProvider";
import { ScoreNotificationControls } from "../src/components/ScoreNotificationControls";
import { ScoreNotificationModal } from "../src/components/ScoreNotificationModal";
import { AppDataTestProvider, createAppData } from "./helpers/appData";
import { oddsGame } from "./helpers/oddsFixture";
import type { Game } from "../src/data/types";
afterEach(cleanup);

it("shows the real updated score, plays armed audio once, and offers immediate mute and dismissal", async () => {
  const audio = {
    unlock: vi.fn().mockResolvedValue(undefined),
    play: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
  };
  const first = {
    ...oddsGame,
    home: { ...oddsGame.home, score: "0" },
    away: { ...oddsGame.away, score: "0" },
  };
  const build = (games: Game[]) => (
    <AppTheme>
      <AppDataTestProvider
        value={createAppData({ favoriteIds: [first.id] })}
        espn={{ games }}
      >
        <ScoreNotificationProvider audioFactory={() => audio}>
          <ScoreNotificationControls />
          <ScoreNotificationModal />
        </ScoreNotificationProvider>
      </AppDataTestProvider>
    </AppTheme>
  );
  const { rerender } = render(build([first]));
  expect(screen.queryByRole("dialog")).toBeNull();
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: copy.scoreNotification.enableSound }),
    );
  });
  rerender(build([{ ...first, home: { ...first.home, score: "7" } }]));
  const dialog = screen.getByRole("dialog");
  const titleId = dialog.getAttribute("aria-labelledby") ?? "";
  const touchdownHeadline = document.getElementById(titleId)?.textContent;
  expect(touchdownHeadline).toBeTruthy();
  const gameTime = within(dialog).getByRole("group", {
    name: copy.scoreNotification.clock,
  });
  expect(within(gameTime).getByText(periodLabel(first.period))).toBeTruthy();
  expect(within(gameTime).getByText(first.clock)).toBeTruthy();
  const scoringScore = within(dialog).getByText("7");
  const chalkCircle = scoringScore.parentElement?.querySelector("img");
  expect(chalkCircle?.getAttribute("src")).toContain("red-chalk-circle.png");
  expect(chalkCircle?.getAttribute("alt")).toBe("");
  expect(
    within(dialog).getByText("0").parentElement?.querySelector("img"),
  ).toBeNull();
  expect(audio.play).toHaveBeenCalledTimes(1);
  expect(audio.play).toHaveBeenLastCalledWith("score");
  fireEvent.click(
    within(dialog).getByRole("button", {
      name: copy.scoreNotification.muteSound,
    }),
  );
  expect(audio.stop).toHaveBeenCalled();
  fireEvent.click(
    within(dialog).getByRole("button", {
      name: copy.scoreNotification.dismissAll,
    }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(
    screen.getByRole("button", { name: copy.scoreNotification.unmuteSound }),
  );
  rerender(
    build([
      {
        ...first,
        period: 6,
        clock: "0:00",
        home: { ...first.home, score: "10" },
      },
    ]),
  );
  const fieldGoalDialog = screen.getByRole("dialog");
  const fieldGoalHeadline = document.getElementById(
    fieldGoalDialog.getAttribute("aria-labelledby") ?? "",
  )?.textContent;
  expect(fieldGoalHeadline).toBeTruthy();
  expect(fieldGoalHeadline).not.toBe(touchdownHeadline);
  const overtimeClock = within(fieldGoalDialog).getByRole("group", {
    name: copy.scoreNotification.clock,
  });
  expect(within(overtimeClock).getByText(periodLabel(6))).toBeTruthy();
  expect(within(overtimeClock).getByText("0:00")).toBeTruthy();
  expect(audio.play).toHaveBeenLastCalledWith("fieldGoal");
});

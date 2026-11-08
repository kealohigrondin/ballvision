import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ScoreNotificationControls } from "../src/components/ScoreNotificationControls";
import {
  scoreNotificationContext,
  type ScoreNotificationData,
} from "../src/context/scoreNotificationContext";

afterEach(cleanup);

const renderControls = (overrides: Partial<ScoreNotificationData>) =>
  render(
    <scoreNotificationContext.Provider
      value={{
        current: undefined,
        pending: 0,
        dismiss: vi.fn(),
        dismissAll: vi.fn(),
        preview: vi.fn(),
        previewAvailable: false,
        soundArmed: false,
        muted: false,
        audioUnavailable: false,
        enableSound: vi.fn().mockResolvedValue(undefined),
        toggleMute: vi.fn(),
        ...overrides,
      }}
    >
      <ScoreNotificationControls />
    </scoreNotificationContext.Provider>,
  );
const iconClass = (name: string) =>
  screen
    .getByRole("button", { name })
    .querySelector("svg")
    ?.getAttribute("class") ?? "";

it.each([
  [{ soundArmed: false }, "Enable chaos sounds", "lucide-bell-off"],
  [{ soundArmed: true, muted: true }, "Unmute chaos sounds", "lucide-bell-off"],
  [{ soundArmed: true, muted: false }, "Mute chaos sounds", "lucide-bell-ring"],
])(
  "shows whether score notifications are on with a bell (%o)",
  (state, label, icon) => {
    renderControls(state);
    expect(iconClass(label)).toContain(icon);
  },
);

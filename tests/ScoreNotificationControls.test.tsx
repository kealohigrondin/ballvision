import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { copy } from "@/copy";
import {
  scoreNotificationContext,
  type ScoreNotificationData,
} from "@/features/notifications/scoreNotificationContext";
import { ScoreNotificationControls } from "@/features/notifications/ScoreNotificationControls";

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
        desktopSupported: false,
        desktopEnabled: false,
        desktopBlocked: false,
        toggleDesktopAlerts: vi.fn().mockResolvedValue(undefined),
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
  [
    { soundArmed: false },
    copy.scoreNotification.enableSound,
    "lucide-bell-off",
  ],
  [
    { soundArmed: true, muted: true },
    copy.scoreNotification.unmuteSound,
    "lucide-bell-off",
  ],
  [
    { soundArmed: true, muted: false },
    copy.scoreNotification.muteSound,
    "lucide-bell-ring",
  ],
])(
  "shows whether score notifications are on with a bell (%o)",
  (state, label, icon) => {
    renderControls(state);
    expect(iconClass(label)).toContain(icon);
  },
);

it.each([
  [
    { desktopEnabled: false },
    copy.scoreNotification.desktopOn,
    "lucide-monitor-off",
  ],
  [
    { desktopEnabled: true },
    copy.scoreNotification.desktopOff,
    "lucide-monitor-check",
  ],
  [
    { desktopBlocked: true },
    copy.scoreNotification.desktopBlocked,
    "lucide-monitor-x",
  ],
])(
  "shows whether desktop notifications are on with a monitor (%o)",
  (state, label, icon) => {
    renderControls({ desktopSupported: true, ...state });
    expect(iconClass(label)).toContain(icon);
  },
);

it("disables the desktop button while the browser blocks notifications", () => {
  renderControls({ desktopSupported: true, desktopBlocked: true });
  expect(
    screen
      .getByRole("button", { name: copy.scoreNotification.desktopBlocked })
      .hasAttribute("disabled"),
  ).toBe(true);
});

it("leaves the desktop button out where the browser has no notifications", () => {
  renderControls({ desktopSupported: false });
  expect(
    screen.queryByRole("button", { name: copy.scoreNotification.desktopOn }),
  ).toBeNull();
});

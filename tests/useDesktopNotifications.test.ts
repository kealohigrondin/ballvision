import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { copy } from "@/copy";
import type {
  DesktopNotifier,
  DesktopPermission,
} from "@/features/notifications/desktopNotifier";
import type { ScoreNotification } from "@/features/notifications/scoreNotifications";
import { useDesktopNotifications } from "@/features/notifications/useDesktopNotifications";

import { oddsGame } from "./helpers/oddsFixture";

const STORAGE_KEY = "ballvision-desktop-alerts";

beforeEach(() => {
  // The page starts in the background: another window has focus.
  vi.spyOn(document, "hasFocus").mockReturnValue(false);
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

const fakeNotifier = (
  permission: DesktopPermission,
  answer: DesktopPermission = permission,
) => ({
  supported: true,
  permission: vi.fn<DesktopNotifier["permission"]>(() => permission),
  requestPermission: vi
    .fn<DesktopNotifier["requestPermission"]>()
    .mockResolvedValue(answer),
  show: vi.fn<DesktopNotifier["show"]>(),
});

const score = (
  overrides: Partial<ScoreNotification> = {},
): ScoreNotification => ({
  id: "slate:game-1:7:0",
  game: oddsGame,
  scoringTeamIds: [oddsGame.away.id],
  points: 7,
  preview: false,
  ...overrides,
});

// Renders the hook with no alerts, then delivers the given ones as new.
const deliver = (notifier: DesktopNotifier, alerts: ScoreNotification[]) => {
  const none: ScoreNotification[] = [];
  const hook = renderHook(
    ({ queue }) => useDesktopNotifications(queue, notifier),
    { initialProps: { queue: none } },
  );
  hook.rerender({ queue: alerts });

  return hook;
};

it("sends a new score to the desktop while the page is in the background", () => {
  localStorage.setItem(STORAGE_KEY, "on");
  const notifier = fakeNotifier("granted");
  deliver(notifier, [score()]);
  expect(notifier.show).toHaveBeenCalledTimes(1);
});

it("sends each score once", () => {
  localStorage.setItem(STORAGE_KEY, "on");
  const notifier = fakeNotifier("granted");
  const alerts = [score()];
  const hook = deliver(notifier, alerts);
  hook.rerender({ queue: [...alerts] });
  expect(notifier.show).toHaveBeenCalledTimes(1);
});

it("leaves a score to the dialog while the page has focus", () => {
  localStorage.setItem(STORAGE_KEY, "on");
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  const notifier = fakeNotifier("granted");
  deliver(notifier, [score()]);
  expect(notifier.show).not.toHaveBeenCalled();
});

it("sends nothing while desktop notifications are off", () => {
  const notifier = fakeNotifier("granted");
  deliver(notifier, [score()]);
  expect(notifier.show).not.toHaveBeenCalled();
});

it("sends nothing for a sound check", () => {
  localStorage.setItem(STORAGE_KEY, "on");
  const notifier = fakeNotifier("granted");
  deliver(notifier, [score({ preview: true })]);
  expect(notifier.show).not.toHaveBeenCalled();
});

it("asks for permission when turned on", async () => {
  const notifier = fakeNotifier("default", "granted");
  const { result } = renderHook(() => useDesktopNotifications([], notifier));
  await act(() => result.current.toggleDesktopAlerts());
  expect(notifier.requestPermission).toHaveBeenCalledTimes(1);
});

it("confirms on the desktop once permission is granted", async () => {
  const notifier = fakeNotifier("default", "granted");
  const { result } = renderHook(() => useDesktopNotifications([], notifier));
  await act(() => result.current.toggleDesktopAlerts());
  expect(notifier.show.mock.calls[0][0].title).toBe(
    copy.scoreNotification.desktopReadyTitle,
  );
});

it("remembers that desktop notifications are on", async () => {
  const notifier = fakeNotifier("default", "granted");
  const { result } = renderHook(() => useDesktopNotifications([], notifier));
  await act(() => result.current.toggleDesktopAlerts());
  expect(localStorage.getItem(STORAGE_KEY)).toBe("on");
});

it("reports notifications as blocked when permission is refused", async () => {
  const notifier = fakeNotifier("default", "denied");
  const { result } = renderHook(() => useDesktopNotifications([], notifier));
  await act(() => result.current.toggleDesktopAlerts());
  expect(result.current.desktopBlocked).toBe(true);
});

it("turns off without asking again", async () => {
  localStorage.setItem(STORAGE_KEY, "on");
  const notifier = fakeNotifier("granted");
  const { result } = renderHook(() => useDesktopNotifications([], notifier));
  await act(() => result.current.toggleDesktopAlerts());
  expect(result.current.desktopEnabled).toBe(false);
});

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { NOTIFICATION_DURATION_MS } from "@/features/notifications/scoreNotifications";
import { useScoreNotifications } from "@/features/notifications/useScoreNotifications";

import { oddsGame } from "./helpers/oddsFixture";
const first = { ...oddsGame, home: { ...oddsGame.home, score: "0" } };
const scored = { ...first, home: { ...first.home, score: "7" } };
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it("queues every scoring game and advances automatically", () => {
  const second = { ...first, id: "game-2" };
  const { result, rerender } = renderHook(
    ({ games }) =>
      useScoreNotifications(games, "slate", true, [first.id, "game-2"]),
    { initialProps: { games: [first, second] } },
  );
  expect(result.current.current).toBeUndefined();
  rerender({
    games: [scored, { ...second, home: { ...second.home, score: "3" } }],
  });
  expect(result.current.current?.game.id).toBe(first.id);
  expect(result.current.pending).toBe(1);
  act(() => {
    vi.advanceTimersByTime(NOTIFICATION_DURATION_MS);
  });
  expect(result.current.current?.game.id).toBe(second.id);
  act(() => result.current.dismissAll());
  expect(result.current.current).toBeUndefined();
});
it("clears the queue and establishes a new baseline when the date or league changes", () => {
  const { result, rerender } = renderHook(
    ({ games, slate }) => useScoreNotifications(games, slate, true, [first.id]),
    { initialProps: { games: [first], slate: "one" } },
  );
  rerender({ games: [scored], slate: "one" });
  expect(result.current.current).toBeTruthy();
  rerender({ games: [scored], slate: "two" });
  expect(result.current.current).toBeUndefined();
});
it("previews the current scoreboard without inventing a live score or changing the baseline", () => {
  const { result, rerender } = renderHook(
    ({ games }) =>
      useScoreNotifications(games, "slate", true, [first.id, "game-2"]),
    { initialProps: { games: [first] } },
  );
  act(() => result.current.preview());
  expect(result.current.current).toMatchObject({
    preview: true,
    game: { home: { score: "0" } },
  });
  act(() => result.current.dismiss());
  rerender({ games: [scored] });
  expect(result.current.current?.preview).toBe(false);
});

it("ignores unpinned scores and removes queued events when unpinned", () => {
  const second = { ...first, id: "unpinned" };
  const { result, rerender } = renderHook(
    ({ games, pinned }) => useScoreNotifications(games, "slate", true, pinned),
    { initialProps: { games: [first, second], pinned: [first.id] } },
  );
  rerender({
    games: [first, { ...second, home: { ...second.home, score: "7" } }],
    pinned: [first.id],
  });
  expect(result.current.current).toBeUndefined();
  rerender({ games: [scored, second], pinned: [first.id] });
  expect(result.current.current?.game.id).toBe(first.id);
  rerender({ games: [scored, second], pinned: [] });
  expect(result.current.current).toBeUndefined();
  expect(result.current.previewAvailable).toBe(false);
  act(() => result.current.preview());
  expect(result.current.current).toBeUndefined();
});
it("does not notify about past scores when a game is pinned", () => {
  const { result, rerender } = renderHook(
    ({ games, pinned }) => useScoreNotifications(games, "slate", true, pinned),
    { initialProps: { games: [first], pinned: [] as string[] } },
  );
  rerender({ games: [scored], pinned: [] });
  rerender({ games: [scored], pinned: [first.id] });
  expect(result.current.current).toBeUndefined();
});

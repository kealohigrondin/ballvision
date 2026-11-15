import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ScoreboardSource } from "@/features/scores/types";
import { useScoreboard } from "@/features/scores/useScoreboard";
import type { Game, Week } from "@/shared/types";
const game = { id: "1" } as Game;

const week = (number: number): Week => ({
  id: `2026-2-${number}`,
  label: `Week ${number}`,
  group: "Regular Season",
  detail: "",
  year: 2026,
  seasonType: 2,
  number,
});
const query = { week: week(10), division: "fbs" as const };
const loadCalendar = vi.fn().mockResolvedValue({ weeks: [] });

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
beforeEach(() => vi.useFakeTimers());
describe("scoreboard refresh lifecycle", () => {
  it("keeps the last good scores when refreshing fails", async () => {
    const load = vi
      .fn()
      .mockResolvedValueOnce([game])
      .mockRejectedValue(new Error("offline"));
    const source: ScoreboardSource = { load, loadCalendar };
    const { result } = renderHook(() => useScoreboard(source, query, false));
    await flush();
    expect(result.current.games).toEqual([game]);
    await act(async () => {
      vi.advanceTimersByTime(20_000);
    });
    expect(result.current.games).toEqual([game]);
    expect(result.current.error).toContain("out of date");
  });
  it("cancels old queries and ignores late responses after changing week", async () => {
    let resolveOld!: (games: Game[]) => void;
    const load = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Game[]>((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValue([]);
    const source: ScoreboardSource = { load, loadCalendar };
    const { result, rerender } = renderHook(
      ({ week }) => useScoreboard(source, { ...query, week }, false),
      { initialProps: { week: query.week } },
    );
    const oldSignal = load.mock.calls[0][1] as AbortSignal;
    rerender({ week: week(11) });
    await flush();
    expect(oldSignal.aborted).toBe(true);
    await act(async () => resolveOld([game]));
    expect(result.current.games).toEqual([]);
  });
  it("loads once when paused and never polls; aborts on unmount", async () => {
    const load = vi.fn().mockResolvedValue([]);
    const source: ScoreboardSource = { load, loadCalendar };
    const { unmount } = renderHook(() => useScoreboard(source, query, true));
    await flush();
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(load).toHaveBeenCalledTimes(1);
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(load).toHaveBeenCalledTimes(1);
  });
});

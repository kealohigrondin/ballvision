import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScoreboard } from "../src/hooks/useScoreboard";
import type { Game, ScoreboardSource } from "../src/data/types";
const game = { id: "1" } as Game;
const query = { date: "2026-10-31", division: "fbs" as const };
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
    const source: ScoreboardSource = { load };
    const { result } = renderHook(() => useScoreboard(source, query, false));
    await flush();
    expect(result.current.games).toEqual([game]);
    await act(async () => {
      vi.advanceTimersByTime(20_000);
    });
    expect(result.current.games).toEqual([game]);
    expect(result.current.error).toContain("out of date");
  });
  it("cancels old queries and ignores late responses after changing date", async () => {
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
    const source: ScoreboardSource = { load };
    const { result, rerender } = renderHook(
      ({ date }) => useScoreboard(source, { ...query, date }, false),
      { initialProps: { date: query.date } },
    );
    const oldSignal = load.mock.calls[0][1] as AbortSignal;
    rerender({ date: "2026-11-01" });
    await flush();
    expect(oldSignal.aborted).toBe(true);
    await act(async () => resolveOld([game]));
    expect(result.current.games).toEqual([]);
  });
  it("loads once when paused and never polls; aborts on unmount", async () => {
    const load = vi.fn().mockResolvedValue([]);
    const source: ScoreboardSource = { load };
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

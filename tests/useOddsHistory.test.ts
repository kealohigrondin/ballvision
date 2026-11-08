import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useOddsHistory } from "../src/hooks/useOddsHistory";
import type { OddsHistory, OddsHistorySource } from "../src/data/types";

const query = { awayTokenId: "222", homeTokenId: "111", range: "1d" as const };
const history: OddsHistory = {
  away: [{ timestamp: 10000, probability: 0.6 }],
  home: [{ timestamp: 10000, probability: 0.4 }],
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it("refreshes open history every 30 seconds and retains data with a stale error", async () => {
  const load = vi
    .fn<OddsHistorySource["load"]>()
    .mockResolvedValueOnce(history)
    .mockRejectedValue(new Error("offline"));
  const source = { load };
  const { result } = renderHook(() => useOddsHistory(source, query, false));
  await flush();
  await act(async () => {
    vi.advanceTimersByTime(30_000);
  });
  expect(load).toHaveBeenCalledTimes(2);
  expect(result.current.data).toEqual(history);
  expect(result.current.error).toBe(true);
});
it("ignores a canceled range response and does not poll while paused", async () => {
  let resolveOld!: (value: OddsHistory) => void;
  const load = vi
    .fn<OddsHistorySource["load"]>()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    )
    .mockResolvedValue({ away: [], home: [] });
  const source = { load };
  const { result, rerender } = renderHook(
    ({ range }: { range: "1h" | "1d" }) =>
      useOddsHistory(source, { ...query, range }, true),
    { initialProps: { range: "1d" } },
  );
  const signal = load.mock.calls[0][1];
  rerender({ range: "1h" });
  await flush();
  await act(async () => {
    resolveOld(history);
  });
  expect(signal.aborted).toBe(true);
  expect(result.current.data).toEqual({ away: [], home: [] });
  await act(async () => {
    vi.advanceTimersByTime(60_000);
  });
  expect(load).toHaveBeenCalledTimes(2);
});

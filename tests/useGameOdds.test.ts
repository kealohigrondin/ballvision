import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import type { GameOddsMap, OddsSource } from "@/features/odds/types";
import { useGameOdds } from "@/features/odds/useGameOdds";

import { oddsGame, oddsQuote } from "./helpers/oddsFixture";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const query = { division: "fbs" as const, games: [oddsGame] };

it("polls independently and marks retained odds stale after an update failure", async () => {
  const load = vi
    .fn<OddsSource["load"]>()
    .mockResolvedValueOnce({ [oddsGame.id]: oddsQuote })
    .mockRejectedValue(new Error("offline"));
  const source = { load };
  const { result } = renderHook(() => useGameOdds(source, query, false));
  await flush();
  expect(result.current.quotes[oddsGame.id]).toEqual(oddsQuote);
  await act(async () => {
    vi.advanceTimersByTime(20_000);
  });
  expect(result.current.error).toBe(true);
  expect(result.current.quotes[oddsGame.id]).toEqual(oddsQuote);
});
it("cancels and clears odds for changed slates and ignores late responses", async () => {
  let resolveOld!: (quotes: GameOddsMap) => void;
  const load = vi
    .fn<OddsSource["load"]>()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    )
    .mockResolvedValue({});
  const source = { load };
  const { result, rerender } = renderHook(
    ({ games }) => useGameOdds(source, { ...query, games }, false),
    { initialProps: { games: [oddsGame] } },
  );
  const signal = load.mock.calls[0][1];
  rerender({ games: [{ ...oddsGame, id: "different-game" }] });
  await flush();
  expect(signal.aborted).toBe(true);
  await act(async () => {
    resolveOld({ [oddsGame.id]: oddsQuote });
  });
  expect(result.current.quotes).toEqual({});
});
it("pauses automatic requests and suspends polling in a hidden tab", async () => {
  const load = vi.fn<OddsSource["load"]>().mockResolvedValue({});
  const source = { load };
  const { rerender } = renderHook(
    ({ paused }) => useGameOdds(source, query, paused),
    { initialProps: { paused: true } },
  );
  await flush();
  await act(async () => {
    vi.advanceTimersByTime(60_000);
  });
  expect(load).toHaveBeenCalledTimes(1);
  rerender({ paused: false });
  await flush();
  vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  act(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const calls = load.mock.calls.length;
  await act(async () => {
    vi.advanceTimersByTime(60_000);
  });
  expect(load).toHaveBeenCalledTimes(calls);
});

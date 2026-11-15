import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type {
  GameSummary,
  GameSummaryQuery,
  GameSummarySource,
} from "@/features/scores/types";
import { useGameSummary } from "@/features/scores/useGameSummary";

afterEach(cleanup);

const summary: GameSummary = {
  leaders: { away: [], home: [] },
  stats: [
    {
      key: "totalYards",
      away: "275",
      home: "468",
      awayValue: 275,
      homeValue: 468,
    },
  ],
  scoringPlays: [],
};

const query: GameSummaryQuery = {
  division: "fbs",
  gameId: "401",
  awayId: "142",
  homeId: "61",
};

const source = (load: GameSummarySource["load"]): GameSummarySource => ({
  load,
});

// Sources are created once per test: a new one each render would restart
// the request every time.
it("loads the game's summary", async () => {
  const loaded = source(vi.fn().mockResolvedValue(summary));
  const { result } = renderHook(() =>
    useGameSummary(loaded, query, false, true),
  );
  await waitFor(() => expect(result.current.summary).toBe(summary));
});

it("asks the source for the queried game", async () => {
  const load = vi.fn().mockResolvedValue(summary);
  const loaded = source(load);
  renderHook(() => useGameSummary(loaded, query, false, true));
  await waitFor(() =>
    expect(load).toHaveBeenCalledWith(query, expect.any(AbortSignal)),
  );
});

it("loads nothing without a query", () => {
  const load = vi.fn().mockResolvedValue(summary);
  const loaded = source(load);
  renderHook(() => useGameSummary(loaded, undefined, false, true));
  expect(load).not.toHaveBeenCalled();
});

it("reports an error when the summary fails to load", async () => {
  const failing = source(vi.fn().mockRejectedValue(new Error("Offline")));
  const { result } = renderHook(() =>
    useGameSummary(failing, query, false, true),
  );
  await waitFor(() => expect(result.current.error).toBe(true));
});

it("stops the request when the details close", async () => {
  const load = vi.fn<GameSummarySource["load"]>(
    () => new Promise(() => undefined),
  );
  const pending = source(load);
  const { unmount } = renderHook(() =>
    useGameSummary(pending, query, false, true),
  );
  await waitFor(() => expect(load).toHaveBeenCalled());
  unmount();
  expect(load.mock.calls[0][1].aborted).toBe(true);
});

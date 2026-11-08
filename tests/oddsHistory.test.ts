import { expect, it, vi } from "vitest";

import {
  createPolymarketHistorySource,
  parseOddsHistory,
} from "../src/data/polymarketHistory";
import { historyAt, withLiveOdds } from "../src/utils/oddsHistory";
import { oddsQuote } from "./helpers/oddsFixture";

it("validates, sorts, and deduplicates prices while preserving zero and one probabilities", () => {
  expect(
    parseOddsHistory({
      history: [
        { t: 20, p: 0.5 },
        { t: 10, p: 0 },
        { t: 20, p: 1 },
        { t: 30, p: 2 },
        { t: NaN, p: 0.2 },
        null,
      ],
    }),
  ).toEqual([
    { timestamp: 10000, probability: 0 },
    { timestamp: 20000, probability: 1 },
  ]);
  expect(() => parseOddsHistory({ error: "Unavailable" })).toThrow();
});
it("fetches both matching outcome histories with the selected range and caches repeat openings", async () => {
  const fetcher = vi
    .fn<typeof fetch>()
    .mockImplementation(
      async () =>
        new Response(JSON.stringify({ history: [{ t: 10, p: 0.5 }] })),
    );
  const source = createPolymarketHistorySource(fetcher);
  const query = {
    awayTokenId: "222",
    homeTokenId: "111",
    range: "1h" as const,
  };
  const signal = new AbortController().signal;
  const result = await source.load(query, signal);
  expect(result.away).toEqual([{ timestamp: 10000, probability: 0.5 }]);
  const urls = fetcher.mock.calls.map(([url]) => new URL(String(url)));
  expect(urls.map((url) => url.searchParams.get("market"))).toEqual([
    "222",
    "111",
  ]);
  expect(
    urls.every(
      (url) =>
        url.searchParams.get("interval") === "1h" &&
        url.searchParams.get("fidelity") === "1",
    ),
  ).toBe(true);
  expect(
    fetcher.mock.calls.every(([, options]) => options?.signal === signal),
  ).toBe(true);
  await source.load(query, signal);
  expect(fetcher).toHaveBeenCalledTimes(2);
  await source.load({ ...query, range: "6h" }, signal);
  expect(fetcher).toHaveBeenCalledTimes(4);
});
it("keeps actual histories separate and appends only a newer live snapshot", () => {
  const history = {
    away: [{ timestamp: 10000, probability: 0.4 }],
    home: [{ timestamp: 15000, probability: 0.55 }],
  };
  const updated = withLiveOdds(history, { ...oddsQuote, updatedAt: 20000 });
  expect(updated.away.at(-1)?.probability).toBe(0.75);
  expect(updated.home.at(-1)?.probability).toBe(0.25);
  expect(historyAt(updated.home, 10000)).toBeUndefined();
  expect(historyAt(updated.away, 16000)).toBe(0.4);
  expect(withLiveOdds(history, { ...oddsQuote, updatedAt: 5000 })).toEqual(
    history,
  );
});

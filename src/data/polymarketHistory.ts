import type { OddsHistory, OddsHistoryPoint, OddsHistorySource } from "./types";

export const parseOddsHistory = (payload: unknown): OddsHistoryPoint[] => {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("history" in payload) ||
    !Array.isArray(payload.history)
  ) {
    throw new Error("Unexpected Polymarket history response.");
  }
  const points = new Map<number, OddsHistoryPoint>();
  for (const point of payload.history) {
    if (!point || typeof point !== "object") {
      continue;
    }
    const { t, p } = point as Record<string, unknown>;
    if (
      typeof t !== "number" ||
      !Number.isFinite(t) ||
      t <= 0 ||
      typeof p !== "number" ||
      !Number.isFinite(p) ||
      p < 0 ||
      p > 1
    ) {
      continue;
    }
    points.set(t, { timestamp: t * 1000, probability: p });
  }

  return [...points.values()].sort((a, b) => a.timestamp - b.timestamp);
};

export const createPolymarketHistorySource = (
  fetcher: typeof fetch = fetch,
): OddsHistorySource => {
  const cache = new Map<string, { data: OddsHistory; expires: number }>();

  return {
    load: async ({ awayTokenId, homeTokenId, range }, signal) => {
      if (!/^\d+$/.test(awayTokenId) || !/^\d+$/.test(homeTokenId)) {
        throw new Error("Invalid Polymarket token IDs.");
      }
      const key = `${awayTokenId}:${homeTokenId}:${range}`;
      const cached = cache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.data;
      }
      const fidelity = { "1h": "1", "6h": "2", "1d": "5" }[range];

      const load = async (market: string) => {
        const url = new URL("https://clob.polymarket.com/prices-history");
        url.search = new URLSearchParams({
          market,
          interval: range,
          fidelity,
        }).toString();
        const response = await fetcher(url.toString(), { signal });
        if (!response.ok) {
          throw new Error(`Polymarket returned HTTP ${response.status}.`);
        }

        return parseOddsHistory(await response.json());
      };
      const [away, home] = await Promise.all([
        load(awayTokenId),
        load(homeTokenId),
      ]);
      const data = { away, home };
      for (const [cacheKey, entry] of cache) {
        if (entry.expires <= Date.now()) {
          cache.delete(cacheKey);
        }
      }
      cache.set(key, { data, expires: Date.now() + 30_000 });

      return data;
    },
  };
};
export const polymarketHistorySource = createPolymarketHistorySource();

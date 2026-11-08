import type { Game, GameOddsMap, OddsSource, Team } from "./types";

type Json = Record<string, unknown>;
export type MoneylineMarket = {
  id: string;
  slug: string;
  start: number;
  outcomes: [string, string];
  tokenIds: [string, string];
};
const obj = (value: unknown): Json =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const strings = (value: unknown): string[] => {
  try {
    const parsed: unknown =
      typeof value === "string" ? JSON.parse(value) : value;
    return list(parsed).filter(
      (item): item is string => typeof item === "string",
    );
  } catch {
    return [];
  }
};
const text = (value: unknown) => (typeof value === "string" ? value : "");
const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\bst\b\.?/g, "state")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]/g, "");
const matchesTeam = (name: string, team: Team) =>
  [team.name, team.location, team.abbreviation].some(
    (alias) => Boolean(alias) && normalize(alias ?? "") === normalize(name),
  );

export const parseMoneylineMarkets = (events: unknown): MoneylineMarket[] =>
  list(events).flatMap((raw) => {
    const event = obj(raw);
    if (event.ended === true || event.closed === true) return [];
    const slug = text(event.slug);
    // Only full-game events, not companion exact-margin or period markets.
    if (!/^(cfb|nfl)-[a-z0-9-]+-\d{4}-\d{2}-\d{2}$/.test(slug)) return [];
    return list(event.markets).flatMap((rawMarket) => {
      const market = obj(rawMarket);
      if (
        market.sportsMarketType !== "moneyline" ||
        market.closed !== false ||
        market.acceptingOrders !== true
      )
        return [];
      const outcomes = strings(market.outcomes);
      const tokens = strings(market.clobTokenIds);
      const start = Date.parse(
        text(event.startTime) ||
          text(market.gameStartTime).replace(" ", "T").replace(/\+00$/, "Z"),
      );
      const id = text(market.id);
      if (
        !id ||
        !Number.isFinite(start) ||
        outcomes.length !== 2 ||
        tokens.length !== 2 ||
        tokens.some((token) => !/^\d+$/.test(token))
      )
        return [];
      return [
        {
          id,
          slug,
          start,
          outcomes: [outcomes[0], outcomes[1]] as [string, string],
          tokenIds: [tokens[0], tokens[1]] as [string, string],
        },
      ];
    });
  });

export const matchMoneyline = (
  game: Game,
  markets: readonly MoneylineMarket[],
) => {
  if (game.state !== "live" && game.state !== "upcoming") return undefined;
  const candidates = markets.filter(
    (market) =>
      Math.abs(market.start - Date.parse(game.start)) < 3 * 60 * 60 * 1000 &&
      ((matchesTeam(market.outcomes[0], game.away) &&
        matchesTeam(market.outcomes[1], game.home)) ||
        (matchesTeam(market.outcomes[1], game.away) &&
          matchesTeam(market.outcomes[0], game.home))),
  );
  const unique = [
    ...new Map(candidates.map((market) => [market.id, market])).values(),
  ];
  // Ambiguous matches should show no odds rather than the wrong game's odds.
  if (unique.length !== 1) return undefined;
  const market = unique[0];
  const awayIndex = matchesTeam(market.outcomes[0], game.away) ? 0 : 1;
  return {
    market,
    awayToken: market.tokenIds[awayIndex],
    homeToken: market.tokenIds[1 - awayIndex],
  };
};
const probability = (value: unknown): number | undefined => {
  const price =
    typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof price === "number" &&
    Number.isFinite(price) &&
    price > 0 &&
    price < 1
    ? price
    : undefined;
};

export const createPolymarketSource = (
  fetcher: typeof fetch = fetch,
): OddsSource => {
  let sports: { value: unknown[]; expires: number } | undefined;
  const cache = new Map<
    string,
    { markets: MoneylineMarket[]; expires: number }
  >();
  const getJson = async (
    url: URL | string,
    signal: AbortSignal,
    init?: RequestInit,
  ): Promise<unknown> => {
    const response = await fetcher(url.toString(), { ...init, signal });
    if (!response.ok)
      throw new Error(`Polymarket returned HTTP ${response.status}.`);
    return response.json();
  };
  return {
    load: async ({ division, games }, signal) => {
      const activeGames = games.filter(
        (game) => game.state === "live" || game.state === "upcoming",
      );
      if (!activeGames.length) return {};
      const times = activeGames
        .map((game) => Date.parse(game.start))
        .filter(Number.isFinite);
      if (!times.length) return {};
      const min = new Date(
        Math.min(...times) - 3 * 60 * 60 * 1000,
      ).toISOString();
      const max = new Date(
        Math.max(...times) + 3 * 60 * 60 * 1000,
      ).toISOString();
      const sport = division === "nfl" ? "nfl" : "cfb";
      const key = `${sport}:${min}:${max}`;
      let cached = cache.get(key);
      if (!cached || cached.expires <= Date.now()) {
        if (!sports || sports.expires <= Date.now()) {
          const payload = await getJson(
            "https://gamma-api.polymarket.com/sports",
            signal,
          );
          if (!Array.isArray(payload))
            throw new Error("Unexpected Polymarket sports response.");
          sports = { value: payload, expires: Date.now() + 300_000 };
        }
        const series = text(
          obj(sports.value.find((entry) => obj(entry).sport === sport)).series,
        );
        if (!/^\d+$/.test(series))
          throw new Error("Polymarket football series is unavailable.");
        const markets: MoneylineMarket[] = [];
        let cursor = "";
        for (let page = 0; page < 10; page++) {
          const url = new URL("https://gamma-api.polymarket.com/events/keyset");
          url.search = new URLSearchParams({
            series_id: series,
            closed: "false",
            limit: "100",
            start_time_min: min,
            start_time_max: max,
            ...(cursor && { after_cursor: cursor }),
          }).toString();
          const response = obj(await getJson(url, signal));
          if (!Array.isArray(response.events))
            throw new Error("Unexpected Polymarket events response.");
          markets.push(...parseMoneylineMarkets(response.events));
          const next = text(response.next_cursor);
          if (!next) {
            cursor = "";
            break;
          }
          if (next === cursor)
            throw new Error("Polymarket pagination did not advance.");
          cursor = next;
        }
        if (cursor) throw new Error("Polymarket event list was truncated.");
        cached = { markets, expires: Date.now() + 120_000 };
        cache.clear();
        cache.set(key, cached);
      }
      const matches = activeGames.flatMap((game) => {
        const match = matchMoneyline(game, cached.markets);
        return match ? [{ game, ...match }] : [];
      });
      const tokenIds = [
        ...new Set(
          matches.flatMap((match) => [match.awayToken, match.homeToken]),
        ),
      ];
      const prices: Json = {};
      // Small batches keep requests efficient without oversized payloads.
      for (let i = 0; i < tokenIds.length; i += 100) {
        Object.assign(
          prices,
          obj(
            await getJson("https://clob.polymarket.com/midpoints", signal, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                tokenIds.slice(i, i + 100).map((token_id) => ({ token_id })),
              ),
            }),
          ),
        );
      }
      const quotes: GameOddsMap = {};
      for (const match of matches) {
        const awayProbability = probability(prices[match.awayToken]);
        const homeProbability = probability(prices[match.homeToken]);
        if (awayProbability === undefined || homeProbability === undefined)
          continue;
        quotes[match.game.id] = {
          source: "Polymarket",
          url: `https://polymarket.com/event/${match.market.slug}`,
          awayTokenId: match.awayToken,
          homeTokenId: match.homeToken,
          awayProbability,
          homeProbability,
          updatedAt: Date.now(),
        };
      }
      return quotes;
    },
  };
};

export const polymarketSource = createPolymarketSource();

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createPolymarketSource,
  matchMoneyline,
  parseMoneylineMarkets,
} from "../src/data/polymarket";
import { americanOdds } from "../src/utils/odds";
import { oddsGame } from "./helpers/oddsFixture";

const market = {
  id: "123",
  sportsMarketType: "moneyline",
  closed: false,
  acceptingOrders: true,
  outcomes: JSON.stringify(["Washington", "Penn State"]),
  clobTokenIds: JSON.stringify(["111", "222"]),
};
const event = {
  slug: "cfb-psu-wash-2026-11-07",
  startTime: oddsGame.start,
  ended: false,
  markets: [market],
};

const response = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
afterEach(() => vi.restoreAllMocks());

describe("Polymarket moneylines", () => {
  it("matches both teams and kickoff, regardless of outcome order, and rejects ambiguous or wrong-day games", () => {
    const markets = parseMoneylineMarkets([event]);
    expect(matchMoneyline(oddsGame, markets)).toMatchObject({
      awayToken: "222",
      homeToken: "111",
    });
    expect(
      matchMoneyline({ ...oddsGame, start: "2026-11-14T20:30:00Z" }, markets),
    ).toBeUndefined();
    expect(
      matchMoneyline(
        {
          ...oddsGame,
          home: {
            ...oddsGame.home,
            name: "Washington State",
            abbreviation: "WSU",
          },
        },
        markets,
      ),
    ).toBeUndefined();
    expect(
      matchMoneyline(oddsGame, [...markets, { ...markets[0], id: "other" }]),
    ).toBeUndefined();
    expect(
      matchMoneyline({ ...oddsGame, state: "final" }, markets),
    ).toBeUndefined();
  });
  it("matches Miami (FL) to ESPN Miami without confusing Miami (OH)", async () => {
    const game = {
      ...oddsGame,
      start: "2026-11-08T00:30:00Z",
      away: {
        ...oddsGame.away,
        name: "Miami",
        location: "Miami",
        abbreviation: "MIA",
      },
      home: {
        ...oddsGame.home,
        name: "Notre Dame",
        location: "Notre Dame",
        abbreviation: "ND",
      },
    };
    const miamiEvent = {
      ...event,
      slug: "cfb-mia-nd-2026-11-07",
      startTime: game.start,
      markets: [
        { ...market, outcomes: JSON.stringify(["Miami (FL)", "Notre Dame"]) },
      ],
    };
    const markets = parseMoneylineMarkets([miamiEvent]);
    expect(matchMoneyline(game, markets)).toMatchObject({
      awayToken: "111",
      homeToken: "222",
    });
    expect(
      matchMoneyline(
        {
          ...game,
          away: {
            ...game.away,
            name: "Miami (OH)",
            location: "Miami (OH)",
            abbreviation: "M-OH",
          },
        },
        markets,
      ),
    ).toBeUndefined();
    expect(
      matchMoneyline({ ...game, start: "2026-11-15T00:30:00Z" }, markets),
    ).toBeUndefined();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response([{ sport: "cfb", series: "999" }]))
      .mockResolvedValueOnce(
        response({ events: [miamiEvent], next_cursor: "" }),
      )
      .mockResolvedValueOnce(response({ "111": "0.4", "222": "0.6" }));
    const quotes = await createPolymarketSource(fetcher).load(
      { division: "fbs", games: [game] },
      new AbortController().signal,
    );
    expect(quotes[game.id]).toMatchObject({
      awayProbability: 0.4,
      homeProbability: 0.6,
      awayTokenId: "111",
      homeTokenId: "222",
    });
  });
  it("ignores closed, suspended, malformed, spread, and companion markets", () => {
    expect(
      parseMoneylineMarkets([
        { ...event, ended: true },
        { ...event, slug: `${event.slug}-exact-margin` },
        {
          ...event,
          markets: [
            { ...market, closed: true },
            { ...market, acceptingOrders: false },
            { ...market, sportsMarketType: "spreads" },
            { ...market, outcomes: "not json" },
          ],
        },
      ]),
    ).toEqual([]);
  });
  it("discovers the current series, follows cursors, batches fresh prices, and caches only discovery", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response([{ sport: "cfb", series: "999" }]))
      .mockResolvedValueOnce(response({ events: [], next_cursor: "next-page" }))
      .mockResolvedValueOnce(response({ events: [event], next_cursor: "" }))
      .mockResolvedValueOnce(response({ "111": "0.25", "222": "0.75" }))
      .mockResolvedValueOnce(response({ "111": "0.4", "222": "0.6" }));
    const source = createPolymarketSource(fetcher);
    const signal = new AbortController().signal;
    const query = { division: "fbs" as const, games: [oddsGame] };
    const quotes = await source.load(query, signal);
    expect(quotes[oddsGame.id]).toMatchObject({
      source: "Polymarket",
      awayProbability: 0.75,
      homeProbability: 0.25,
      url: `https://polymarket.com/event/${event.slug}`,
    });
    expect(
      new URL(String(fetcher.mock.calls[1][0])).searchParams.get("series_id"),
    ).toBe("999");
    expect(
      new URL(String(fetcher.mock.calls[2][0])).searchParams.get(
        "after_cursor",
      ),
    ).toBe("next-page");
    expect(JSON.parse(String(fetcher.mock.calls[3][1]?.body))).toEqual([
      { token_id: "222" },
      { token_id: "111" },
    ]);
    expect(
      fetcher.mock.calls.every(([, init]) => init?.signal === signal),
    ).toBe(true);
    expect(
      (await source.load(query, signal))[oddsGame.id].awayProbability,
    ).toBe(0.6);
    expect(fetcher).toHaveBeenCalledTimes(5);
  });
  it("does not substitute cached discovery prices when the live order book has no quote", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response([{ sport: "nfl", series: "123" }]))
      .mockResolvedValueOnce(
        response({
          events: [{ ...event, slug: "nfl-psu-wash-2026-11-07" }],
          next_cursor: "",
        }),
      )
      .mockResolvedValueOnce(response({ "111": "0", "222": "NaN" }));
    expect(
      await createPolymarketSource(fetcher).load(
        { division: "nfl", games: [oddsGame] },
        new AbortController().signal,
      ),
    ).toEqual({});
  });
  it("converts probabilities to American odds and handles invalid and terminal prices", () => {
    expect(americanOdds(0.75)).toBe("-300");
    expect(americanOdds(0.25)).toBe("+300");
    expect(americanOdds(0.5)).toBe("-100");
    for (const price of [0, 1, NaN, -1, 2]) {
      expect(americanOdds(price)).toBe("—");
    }
  });
});

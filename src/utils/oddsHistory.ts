import type { GameOdds, OddsHistory, OddsHistoryPoint } from "../data/types";

export const withLiveOdds = (
  history: OddsHistory,
  quote: GameOdds,
): OddsHistory => {
  const append = (points: OddsHistoryPoint[], probability: number) => {
    const last = points.at(-1);
    if (last && quote.updatedAt < last.timestamp) return points;
    return [
      ...points.filter((point) => point.timestamp !== quote.updatedAt),
      { timestamp: quote.updatedAt, probability },
    ];
  };
  return {
    away: append(history.away, quote.awayProbability),
    home: append(history.home, quote.homeProbability),
  };
};

export const historyAt = (
  points: readonly OddsHistoryPoint[],
  timestamp: number,
) => {
  let value: number | undefined;
  for (const point of points) {
    if (point.timestamp > timestamp) break;
    value = point.probability;
  }
  return value;
};

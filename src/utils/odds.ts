export const americanOdds = (probability: number): string => {
  if (!Number.isFinite(probability) || probability <= 0 || probability >= 1) {
    return "—";
  }
  if (probability >= 0.5) {
    return `-${Math.round((100 * probability) / (1 - probability))}`;
  }

  return `+${Math.round((100 * (1 - probability)) / probability)}`;
};

export const formatProbability = (probability: number | undefined): string =>
  probability === undefined
    ? "—"
    : `${(probability * 100).toFixed(1)}% (${americanOdds(probability)})`;

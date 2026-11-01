// Shared sizing keeps loading placeholders aligned with the game cards.
export const getGameGridSize = (compact: boolean) => ({
  xs: 12,
  sm: 6,
  md: compact ? 6 : 3,
  lg: compact ? 6 : 4,
});

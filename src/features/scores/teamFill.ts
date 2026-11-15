/**
 * The fill that marks a team in stat bars and legends: solid for the home
 * team, hatched for the away team, so the two differ by more than color.
 */
export const teamFill = (color: string, hatched: boolean): string =>
  hatched
    ? `repeating-linear-gradient(-45deg, ${color} 0 2px, transparent 2px 4px)`
    : color;

/**
 * The fill that marks a team in stat bars, legends and charts: solid for the
 * home team, hatched for the away team, so the two differ by more than
 * color. Line charts use the matching dash pattern below.
 */
export const teamFill = (color: string, hatched: boolean): string =>
  hatched
    ? `repeating-linear-gradient(-45deg, ${color} 0 2px, transparent 2px 4px)`
    : color;

/** The SVG dash pattern for the away team's lines; home lines are solid. */
export const AWAY_LINE_DASH = "4 3";

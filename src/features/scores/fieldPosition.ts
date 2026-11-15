import type { Team } from "@/shared/types";

/**
 * Where the ball sits across a header that shows the away team on the left
 * and the home team on the right: 0 is the away goal line, 100 the home one.
 * ESPN measures `yardLine` from the home goal line.
 */
export const fieldPercent = (yardLine: number): number =>
  Math.min(100, Math.max(0, 100 - yardLine));

/** The yard line as a broadcast reads it, e.g. "UGA 24" or "50". */
export const fieldLabel = (
  yardLine: number,
  away: Team,
  home: Team,
): string => {
  if (yardLine === 50) {
    return "50";
  }

  return yardLine < 50
    ? `${home.abbreviation} ${yardLine}`
    : `${away.abbreviation} ${100 - yardLine}`;
};

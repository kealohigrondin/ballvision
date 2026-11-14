import { copy } from "@/copy";

import type { LeagueRow } from "./types";

export type RankTrendDirection = "up" | "down" | "none";

// How a ranked team moved since the previous poll, as shown in the TREND
// column: "+3" up, "-4" down, "-" unchanged, "NEW" newly ranked.
export const rankTrend = ({
  rankChange,
  newlyRanked,
}: Pick<LeagueRow, "rankChange" | "newlyRanked">): {
  label: string;
  direction: RankTrendDirection;
} => {
  if (newlyRanked) {
    return { label: copy.league.trendNew, direction: "up" };
  }
  if (rankChange === undefined) {
    return { label: copy.common.emptyValue, direction: "none" };
  }
  if (rankChange > 0) {
    return { label: `+${rankChange}`, direction: "up" };
  }
  if (rankChange < 0) {
    return { label: String(rankChange), direction: "down" };
  }

  return { label: copy.league.trendUnchanged, direction: "none" };
};

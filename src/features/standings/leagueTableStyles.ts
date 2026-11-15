import type { SxProps, Theme } from "@mui/material/styles";

import { teamColumnTableSx } from "@/shared/tableStyles";

export const leagueTableSx = {
  ...teamColumnTableSx(1),
  // Tighter number columns leave the team name more room.
  "& .MuiTableCell-root:not(:first-of-type)": { px: 1 },
  // A heavier rule under rows marked dividerAfter, e.g. a playoff cut line.
  "& .league-row-divider .MuiTableCell-root": {
    borderBottomWidth: 2,
    borderBottomColor: "text.secondary",
  },
  "& .league-row-divider-dashed .MuiTableCell-root": {
    borderBottomStyle: "dashed",
  },
} satisfies SxProps<Theme>;

// Rank movement colors for the Top 25 TREND column.
export const rankTrendColor = {
  up: "success.main",
  down: "error.main",
  none: "inherit",
} as const;

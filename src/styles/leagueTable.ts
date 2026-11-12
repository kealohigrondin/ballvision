import type { SxProps, Theme } from "@mui/material/styles";

// The given column takes all leftover width; the others shrink to fit.
export const teamColumnTableSx = (column: number) =>
  ({
    width: "100%",
    tableLayout: "auto",
    "& .MuiTableCell-root": { width: "1px", whiteSpace: "nowrap" },
    [`& .MuiTableCell-root:nth-child(${column})`]: {
      width: "100%",
      whiteSpace: "normal",
    },
  }) satisfies SxProps<Theme>;

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

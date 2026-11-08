import type { SxProps, Theme } from "@mui/material/styles";

export const compactBoxScoreSx = {
  "& .MuiTableCell-root": { px: 1, py: 0.25, typography: "caption" },
  "& .period-heading, & .team-period": {
    px: "var(--mui-app-periodColumnPadding)",
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
  },
} satisfies SxProps<Theme>;

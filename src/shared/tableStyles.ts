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

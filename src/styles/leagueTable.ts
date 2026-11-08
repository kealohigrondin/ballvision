import type { SxProps, Theme } from "@mui/material/styles";

export const teamColumnTableSx = (column: number): SxProps<Theme> => ({
  width: "100%",
  tableLayout: "auto",
  "& .MuiTableCell-root": { width: "1px", whiteSpace: "nowrap" },
  [`& .MuiTableCell-root:nth-child(${column})`]: {
    width: "100%",
    whiteSpace: "normal",
  },
});

import type { SxProps, Theme } from "@mui/material/styles";

export const controlHeightSx = {
  height: "var(--mui-app-controlHeight)",
  minHeight: "var(--mui-app-controlHeight)",
  boxSizing: "border-box",
} satisfies SxProps<Theme>;
export const visuallyHiddenSx = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
} satisfies SxProps<Theme>;
export const liveDotSx = {
  width: "5px",
  height: "5px",
  borderRadius: "50%",
  background: "var(--mui-palette-primary-main)",
  flexShrink: 0,
} satisfies SxProps<Theme>;

export const iconButtonSx = {
  display: "grid",
  placeItems: "center",
  width: "30px",
  height: "30px",
  flexShrink: 0,
  border: 0,
  borderRadius: "50%",
  background: "var(--mui-app-colors-inputSurface)",
  color: "var(--mui-app-colors-icon)",
  "&:hover": {
    background: "var(--mui-app-colors-iconHoverSurface)",
    color: "var(--mui-app-colors-iconHover)",
  },
} satisfies SxProps<Theme>;

export const segmentedButtonSx = {
  ...controlHeightSx,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  gap: "6px",
  padding: { xs: "4px", sm: "4px 8px" },
  border: 0,
  borderRadius: "22px",
  background: "transparent",
  color: "var(--mui-app-colors-filterText)",
  '&[aria-pressed="true"]': {
    color: "var(--mui-palette-text-primary)",
    background: "var(--mui-app-colors-divisionSelectedSurface)",
    "& .count": { color: "var(--mui-palette-text-primary)" },
  },
} satisfies SxProps<Theme>;

export const tableCellSx = {
  borderBottom: "1px solid var(--mui-app-colors-tableBorder)",
  textAlign: "right",
} satisfies SxProps<Theme>;

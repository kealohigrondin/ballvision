import type { CSSObject, Theme } from "@mui/material/styles";

// Bridge existing semantic markup to MUI typography while component CSS owns layout.
export const getTypographyStyles = (theme: Theme): CSSObject => ({
  ":root": {
    fontFamily: theme.typography.fontFamily,
    fontSynthesis: "none",
    fontWeight: theme.typography.fontWeightRegular,
  },
  ".eyebrow": {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  ".section-heading h2": {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".year": { fontWeight: theme.typography.fontWeightRegular },
  ".results-heading": {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  ".results-heading span:last-child": {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
  },
  ".app-shell footer": { fontSize: theme.typography.overline.fontSize },
  ".footer-brand": {
    fontSize: theme.typography.overline.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".footer-brand span": { fontWeight: theme.typography.fontWeightRegular },
  ".empty-state h2": {
    fontSize: theme.typography.h6.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".empty-state p": { fontSize: theme.typography.body1.fontSize },
  ".error-banner": { fontSize: theme.typography.body2.fontSize },
  ".game-state": {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    fontVariantNumeric: "tabular-nums",
  },
  ".card-situation": { fontSize: theme.typography.caption.fontSize },
  ".broadcast": { fontSize: theme.typography.overline.fontSize },
  ".red-zone-label": {
    fontSize: theme.typography.overline.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".game-details summary": { fontSize: theme.typography.caption.fontSize },
  ".game-details p": { fontSize: theme.typography.body2.fontSize },
  ".game-details strong": {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".venue": { fontSize: theme.typography.overline.fontSize },
  ".league-panel h2": {
    fontSize: theme.typography.subtitle1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".league-select-label": { fontSize: theme.typography.caption.fontSize },
  ".league-select-label select": {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body2.fontSize,
  },
  ".league-message, .league-note": {
    fontSize: theme.typography.caption.fontSize,
  },
  ".league-note": { fontSize: theme.typography.overline.fontSize },
  ".league-warning": { fontSize: theme.typography.caption.fontSize },
  ".league-table": {
    fontSize: theme.typography.body2.fontSize,
    fontVariantNumeric: "tabular-nums",
  },
  ".league-table caption": {
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.subtitle2.fontSize,
  },
  ".league-table caption span": {
    fontSize: theme.typography.overline.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
  },
  ".league-table tbody th": { fontWeight: theme.typography.fontWeightMedium },
  ".league-table thead th": {
    fontSize: theme.typography.overline.fontSize,
    fontWeight: theme.typography.fontWeightRegular,
  },
  ".league-rank": { fontWeight: theme.typography.fontWeightRegular },
  ".brand": {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".brand-light": { fontWeight: theme.typography.fontWeightRegular },
  ".edition": { fontSize: theme.typography.overline.fontSize },
  ".league-toggle": {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  ".table-scroll table": {
    fontSize: theme.typography.caption.fontSize,
    fontVariantNumeric: "tabular-nums",
  },
  ".table-scroll thead th": { fontWeight: theme.typography.fontWeightRegular },
  ".sync-status": {
    fontSize: theme.typography.overline.fontSize,
    fontVariantNumeric: "tabular-nums",
  },
  ".team-logo": {
    fontSize: theme.typography.overline.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".team-name": {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  ".rank": { fontSize: theme.typography.overline.fontSize },
  ".record": { fontSize: theme.typography.overline.fontSize },
  ".possession": { fontSize: theme.typography.overline.fontSize },
  ".score": {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    fontVariantNumeric: "tabular-nums",
  },
  ".date-control input": { fontSize: theme.typography.body2.fontSize },
  ".today-button": {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".division-switch button": {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
  },
  ".search input": { fontSize: theme.typography.body2.fontSize },
  ".search button": { fontSize: theme.typography.h6.fontSize },
  ".filter-bar button": {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  },
  ".count": {
    fontSize: theme.typography.overline.fontSize,
    fontVariantNumeric: "tabular-nums",
  },
  "@media (max-width:640px)": {
    ".brand": { fontSize: theme.typography.h5.fontSize },
    ".league-toggle": { fontSize: theme.typography.body2.fontSize },
  },
  "@media (max-width:400px)": {
    ".filter-bar button": { fontSize: theme.typography.caption.fontSize },
  },
});

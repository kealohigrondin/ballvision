import { createTheme } from "@mui/material/styles";
import montserratFont from "./assets/fonts/Montserrat-Variable.ttf";
import { getTypographyStyles } from "./themeTypography";

export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "dark",
    primary: { main: "#67e68d" },
    background: { default: "#050506", paper: "#202023" },
    text: { primary: "#f5f5f7", secondary: "#a1a1aa" },
    divider: "#ffffff14",
    warning: { main: "#f6c88b" },
    error: { main: "#ff8a82" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "Montserrat, sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontSize: "50px",
      fontWeight: 600,
      lineHeight: 1,
    },
    h2: { fontSize: "2rem", fontWeight: 600 },
    h3: { fontSize: "clamp(1.625rem, 3vw, 2.25rem)", fontWeight: 600 },
    h4: { fontSize: "1.75rem", fontWeight: 600 },
    h5: { fontSize: "1.375rem", fontWeight: 600 },
    h6: { fontSize: "1.3125rem", fontWeight: 600 },
    subtitle1: { fontSize: "1rem" },
    subtitle2: { fontSize: "0.875rem" },
    body1: { fontSize: "0.8125rem" },
    body2: { fontSize: "0.75rem" },
    caption: { fontSize: "0.6875rem" },
    overline: { fontSize: "0.625rem" },
    button: { fontSize: "0.75rem", fontWeight: 500, textTransform: "none" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        "@font-face": {
          fontFamily: "Montserrat",
          fontStyle: "normal",
          fontWeight: "100 900",
          fontDisplay: "swap",
          src: `url("${montserratFont}") format("truetype")`,
        },
        ...getTypographyStyles(theme),
        body: { ...theme.typography.body1, fontSynthesis: "none" },
      }),
    },
    MuiTable: {
      styleOverrides: { root: { "& caption": { captionSide: "top" } } },
    },
    MuiTableCell: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          fontFamily: "inherit",
          fontSize: "inherit",
          lineHeight: "inherit",
          color: "inherit",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 24, textTransform: "none" } },
    },
  },
});

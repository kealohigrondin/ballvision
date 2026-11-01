import { createTheme } from "@mui/material/styles";
import { getGlobalStyles } from "./styles/globalStyles";

const darkColors = {
  year: "#86868e",
  resultsLabel: "#a1a1aa",
  footerMuted: "#82828b",
  footerBrand: "#d6d6db",
  emptyText: "#aaaab3",
  emptyIcon: "#67e68d",
  emptyHeading: "#f5f5f7",
  skeleton: "#303035",
  warningBorder: "#b383463d",
  warningSurface: "#3a2c1f",
  warningText: "#f6c88b",
  tableText: "#dedee3",
  tableBorder: "#ffffff12",
  tableHeading: "#9999a3",
  icon: "#b8b8c0",
  iconHoverSurface: "#ffffff12",
  iconHover: "#ffffff",
  inputSurface: "#ffffff0d",
  inputText: "#f5f5f7",
  buttonText: "#d1d1d8",
  buttonHoverSurface: "#ffffff1a",
  divisionSelectedSurface: "#ffffff20",
  searchIcon: "#aaaab3",
  placeholder: "#a1a1aa",
  filterText: "#b1b1ba",
  badgeSurface: "#ffffff0d",
  badgeText: "#b6b6bf",
  badgeSelectedSurface: "#ffffff18",
  detailsSurface: "#10101266",
  detailsBorder: "#ffffff0d",
  detailsLabel: "#c0c0c8",
  detailsText: "#c7c7cf",
  venue: "#a6a6b0",
  cardBorder: "#ffffff0a",
  cardHoverBorder: "#ffffff26",
  liveBorder: "#67e68d",
  redZone: "#ff8a82",
  gameStatus: "#bfbfc8",
  gameFinal: "#bfbfc8",
  favorite: "#adadb7",
  situation: "#e0e0e7",
  broadcast: "#adadb7",
  rank: "#bfbfc9",
  record: "#b6b6c1",
  paused: "#b1b1b9",
  syncWarning: "#f6c88b",
  brandMark: "#ffffff",
  transparent: "transparent",
  headerGlow: "#0c57278c",
  headerGlowEdge: "#06351930",
  cardShade: "#19191d",
  shadow: "#00000030",
};
const lightColors = {
  year: "#73737d",
  resultsLabel: "#62626c",
  footerMuted: "#62626c",
  footerBrand: "#393942",
  emptyText: "#62626c",
  emptyIcon: "#16783a",
  emptyHeading: "#19191d",
  skeleton: "#e0e1e6",
  warningBorder: "#89541040",
  warningSurface: "#fff3df",
  warningText: "#895410",
  tableText: "#393942",
  tableBorder: "#00000012",
  tableHeading: "#62626c",
  icon: "#62626c",
  iconHoverSurface: "#0000000a",
  iconHover: "#19191d",
  inputSurface: "#00000006",
  inputText: "#19191d",
  buttonText: "#393942",
  buttonHoverSurface: "#0000000d",
  divisionSelectedSurface: "#00000012",
  searchIcon: "#62626c",
  placeholder: "#62626c",
  filterText: "#62626c",
  badgeSurface: "#00000006",
  badgeText: "#62626c",
  badgeSelectedSurface: "#0000000d",
  detailsSurface: "#ffffff66",
  detailsBorder: "#0000000d",
  detailsLabel: "#393942",
  detailsText: "#393942",
  venue: "#62626c",
  cardBorder: "#0000000d",
  cardHoverBorder: "#00000026",
  liveBorder: "#16783a",
  redZone: "#b53630",
  gameStatus: "#62626c",
  gameFinal: "#62626c",
  favorite: "#62626c",
  situation: "#393942",
  broadcast: "#62626c",
  rank: "#62626c",
  record: "#62626c",
  paused: "#62626c",
  syncWarning: "#895410",
  brandMark: "#19191d",
  headerGlow: "#b9e4c78c",
  headerGlowEdge: "#dcefe330",
  cardShade: "#ffffff",
  shadow: "#0000000d",
};

type AppTokens = {
  controlHeight: string;
  background: string;
  teamColorTint: string;
  teamColorFallback: string;
  colors: typeof darkColors;
};

declare module "@mui/material/styles" {
  interface Theme {
    app: AppTokens;
  }
  interface ThemeOptions {
    app?: AppTokens;
  }
}

export const createAppTheme = (mode: "light" | "dark") =>
  createTheme({
    cssVariables: true,
    app: {
      controlHeight: "36px",
      background:
        "radial-gradient( ellipse 100% 400px at 40% 0, var(--mui-app-colors-headerGlow), var(--mui-app-colors-headerGlowEdge) 55%, var(--mui-app-colors-transparent) ), var(--mui-palette-background-default)",
      teamColorTint: mode === "light" ? "50%" : "28%",
      teamColorFallback: "#72727c",
      colors: { ...darkColors, ...(mode === "light" && lightColors) },
    },
    palette: {
      mode,
      ...(mode === "light"
        ? {
            primary: { main: "#16783a" },
            background: { default: "#f5f6f8", paper: "#ffffff" },
            text: { primary: "#19191d", secondary: "#62626c" },
            divider: "#00000014",
            warning: { main: "#895410" },
            error: { main: "#b53630" },
          }
        : {
            primary: { main: "#67e68d" },
            background: { default: "#050506", paper: "#202023" },
            text: { primary: "#f5f5f7", secondary: "#a1a1aa" },
            divider: "#ffffff14",
            warning: { main: "#f6c88b" },
            error: { main: "#ff8a82" },
          }),
    },
    typography: { fontFamily: "Montserrat, sans-serif" },
    components: { MuiCssBaseline: { styleOverrides: getGlobalStyles(mode) } },
  });

export const theme = createAppTheme("dark");

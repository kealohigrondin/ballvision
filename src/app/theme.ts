import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    app: {
      controlHeight: string;
      controlBorderRadius: string;
      paperBorderRadius: string;
      boxScoreMinWidth: number;
      periodColumnPadding: string;
      navigationBarHeight: number;
    };
  }
  interface ThemeOptions {
    app?: {
      controlHeight: string;
      controlBorderRadius: string;
      paperBorderRadius: string;
      boxScoreMinWidth: number;
      periodColumnPadding: string;
      navigationBarHeight: number;
    };
  }
}

export const createAppTheme = (mode: "light" | "dark") =>
  createTheme({
    cssVariables: true,
    app: {
      controlHeight: "32px",
      controlBorderRadius: "4px",
      paperBorderRadius: "8px",
      boxScoreMinWidth: 325,
      periodColumnPadding: "0.4rem",
      navigationBarHeight: 80,
    },
    typography: {
      fontFamily: "Montserrat, sans-serif",
      // MUI scales every variant from this base (its default is 14).
      fontSize: 12,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            "&:is(article, aside)": {
              borderRadius: "var(--mui-app-paperBorderRadius)",
            },
            "&:is(article)": { overflow: "hidden" },
          },
        },
      },
      // Box has no theme styleOverrides, so target its root class globally.
      MuiCssBaseline: {
        styleOverrides: {
          ".MuiBox-root": {
            borderRadius: "var(--mui-app-paperBorderRadius)",
          },
        },
      },
      MuiTextField: { defaultProps: { size: "small" } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            height: "var(--mui-app-controlHeight)",
            borderRadius: "var(--mui-app-controlBorderRadius)",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            height: "var(--mui-app-controlHeight)",
            borderRadius: "var(--mui-app-controlBorderRadius)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            height: "var(--mui-app-controlHeight)",
            borderRadius: "var(--mui-app-controlBorderRadius)",
          },
        },
      },
    },
    palette: {
      mode,
      primary: { main: mode === "light" ? "#16783a" : "#67e68d" },
    },
  });

export const theme = createAppTheme("dark");

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    app: {
      controlHeight: string;
      controlBorderRadius: string;
      paperBorderRadius: string;
      boxScoreMinWidth: number;
    };
  }
  interface ThemeOptions {
    app?: {
      controlHeight: string;
      controlBorderRadius: string;
      paperBorderRadius: string;
      boxScoreMinWidth: number;
    };
  }
}

export const createAppTheme = (mode: "light" | "dark") =>
  createTheme({
    cssVariables: true,
    app: {
      controlHeight: "40px",
      controlBorderRadius: "20px",
      paperBorderRadius: "20px",
      boxScoreMinWidth: 350,
    },
    typography: { fontFamily: "Montserrat, sans-serif" },
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

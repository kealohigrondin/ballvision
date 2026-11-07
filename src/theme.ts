import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    app: { controlHeight: string };
  }
  interface ThemeOptions {
    app?: { controlHeight: string };
  }
}

export const createAppTheme = (mode: "light" | "dark") =>
  createTheme({
    cssVariables: true,
    app: { controlHeight: "40px" },
    components: {
      MuiTextField: { defaultProps: { size: "small" } },
      MuiOutlinedInput: {
        styleOverrides: { root: { height: "var(--mui-app-controlHeight)" } },
      },
      MuiToggleButton: {
        styleOverrides: { root: { height: "var(--mui-app-controlHeight)" } },
      },
    },
    palette: {
      mode,
      primary: { main: mode === "light" ? "#16783a" : "#67e68d" },
    },
  });

export const theme = createAppTheme("dark");

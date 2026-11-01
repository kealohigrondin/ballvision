import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode: "light" | "dark") =>
  createTheme({
    cssVariables: true,
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
  });

export const theme = createAppTheme("dark");

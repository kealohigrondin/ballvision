import { createTheme } from "@mui/material/styles";

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
  typography: { fontFamily: "Montserrat, sans-serif" },
});

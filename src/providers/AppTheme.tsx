import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { ColorModeContext } from "../context/ColorModeContext";
import { createAppTheme } from "../theme";

type AppThemeProps = { children: ReactNode };

export const AppTheme = ({ children }: AppThemeProps) => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("ballvision-color-mode") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleMode: () =>
        setMode((current) => (current === "dark" ? "light" : "dark")),
    }),
    [mode],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = mode;

    try {
      localStorage.setItem("ballvision-color-mode", mode);
    } catch {
      // Switching themes still works when browser storage is unavailable.
    }
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

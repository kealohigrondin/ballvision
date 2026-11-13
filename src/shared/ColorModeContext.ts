import { createContext, useContext } from "react";

export const ColorModeContext = createContext({
  mode: "dark" as "light" | "dark",
  toggleMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

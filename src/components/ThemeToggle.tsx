import { Moon, Sun } from "lucide-react";
import { useColorMode } from "../context/ColorModeContext";
import { MastHeadIconButton } from "./MastHeadIconButton";

type ThemeToggleProps = Record<string, never>;

export const ThemeToggle = ({}: ThemeToggleProps) => {
  const { mode, toggleMode } = useColorMode();
  const label =
    mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const icon = mode === "dark" ? Sun : Moon;

  return (
    <MastHeadIconButton
      icon={icon}
      label={label}
      onClick={toggleMode}
      color="inherit"
    />
  );
};

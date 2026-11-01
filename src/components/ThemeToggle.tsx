import IconButton from "@mui/material/IconButton";
import { Moon, Sun } from "lucide-react";
import { useColorMode } from "../context/ColorModeContext";

type ThemeToggleProps = Record<string, never>;

export const ThemeToggle = ({}: ThemeToggleProps) => {
  const { mode, toggleMode } = useColorMode();
  const label =
    mode === "dark" ? "Switch to light mode" : "Switch to dark mode";
  const icon = mode === "dark" ? <Sun size={20} /> : <Moon size={20} />;

  return (
    <IconButton
      onClick={toggleMode}
      aria-label={label}
      title={label}
      color="inherit"
    >
      {icon}
    </IconButton>
  );
};

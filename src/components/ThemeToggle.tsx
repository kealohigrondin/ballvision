import { Moon, Sun } from "lucide-react";
import { useColorMode } from "../context/ColorModeContext";
import { MastHeadIconButton } from "./MastHeadIconButton";
import { copy } from "../copy";

type ThemeToggleProps = Record<string, never>;

export const ThemeToggle = ({}: ThemeToggleProps) => {
  const { mode, toggleMode } = useColorMode();
  const label = mode === "dark" ? copy.theme.toLight : copy.theme.toDark;
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

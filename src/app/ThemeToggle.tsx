import { Moon, Sun } from "lucide-react";

import { copy } from "@/copy";
import { useColorMode } from "@/shared/ColorModeContext";
import { ToolbarIconButton } from "@/shared/components/ToolbarIconButton";

type ThemeToggleProps = { showLabels?: boolean };

export const ThemeToggle = ({ showLabels = false }: ThemeToggleProps) => {
  const { mode, toggleMode } = useColorMode();
  const label = mode === "dark" ? copy.theme.toLight : copy.theme.toDark;
  const icon = mode === "dark" ? Sun : Moon;

  return (
    <ToolbarIconButton
      icon={icon}
      label={label}
      onClick={toggleMode}
      color="inherit"
      showLabel={showLabels}
    />
  );
};

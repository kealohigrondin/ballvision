import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type NavRailItemProps = {
  /** Accessible name; also shown as a hover hint and, optionally, as text. */
  label: string;
  showLabel?: boolean;
  icon: ReactNode;
  active: boolean;
  disabled?: boolean;
  controls: string;
  onClick: () => void;
};

export const NavRailItem = ({
  label,
  showLabel = false,
  icon,
  active,
  disabled = false,
  controls,
  onClick,
}: NavRailItemProps) => (
  <ButtonBase
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    aria-expanded={active}
    aria-controls={controls}
    title={label}
    sx={{
      flexDirection: "column",
      gap: 0.5,
      width: "100%",
      minWidth: 0,
      py: 0.5,
      color: "text.primary",
      opacity: disabled ? 0.38 : 1,
      "&:hover .nav-rail-indicator": {
        boxShadow: (theme) =>
          active ? theme.app.win98.bevel.pressed : theme.app.win98.bevel.button,
      },
      "&.Mui-focusVisible .nav-rail-indicator": {
        outline: "1px dotted",
        outlineOffset: -4,
      },
    }}
  >
    <Box
      className="nav-rail-indicator"
      sx={{
        display: "grid",
        placeItems: "center",
        width: 56,
        height: 32,
        // Windows 98 toolbar button: flat until hovered, latched when active.
        background: (theme) =>
          active ? theme.app.win98.checkered : "transparent",
        boxShadow: (theme) => (active ? theme.app.win98.bevel.pressed : "none"),
      }}
    >
      {icon}
    </Box>
    {showLabel && (
      <Typography
        component="span"
        sx={{
          maxWidth: "100%",
          fontSize: "0.75rem",
          fontWeight: active ? 700 : 500,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    )}
  </ButtonBase>
);

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
      color: active ? "text.primary" : "text.secondary",
      opacity: disabled ? 0.38 : 1,
      "&:hover .nav-rail-indicator": {
        bgcolor: active ? "primary.dark" : "action.hover",
      },
      "&.Mui-focusVisible .nav-rail-indicator": {
        outline: "2px solid",
        outlineColor: "primary.main",
        outlineOffset: 2,
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
        transition: "background-color 150ms",
        bgcolor: active ? "primary.main" : "transparent",
        color: active ? "primary.contrastText" : "inherit",
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

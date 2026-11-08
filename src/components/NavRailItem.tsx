import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

type NavRailItemProps = {
  label?: string;
  icon: ReactNode;
  active: boolean;
  disabled?: boolean;
  controls: string;
  onClick: () => void;
};

export const NavRailItem = ({
  label = "",
  icon,
  active,
  disabled = false,
  controls,
  onClick,
}: NavRailItemProps) => (
  <ButtonBase
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    aria-expanded={active}
    aria-controls={controls}
    title={label}
    sx={{
      flexDirection: "column",
      gap: 0.5,
      width: "80%",
      py: 0.5,
      borderRadius: 2,
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
        borderRadius: 4,
        transition: "background-color 150ms",
        bgcolor: active ? "primary.main" : "transparent",
        color: active ? "primary.contrastText" : "inherit",
      }}
    >
      {icon}
    </Box>
    <Typography
      component="span"
      sx={{ fontSize: "0.75rem", fontWeight: active ? 700 : 500 }}
    >
      {label}
    </Typography>
  </ButtonBase>
);

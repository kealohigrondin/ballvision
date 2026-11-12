import Button from "@mui/material/Button";
import IconButton, { type IconButtonProps } from "@mui/material/IconButton";
import type { LucideIcon } from "lucide-react";

// Every masthead control shares the pause button's icon size so the
// buttons render at one size.
export const MASTHEAD_ICON_SIZE = 17;

type MastHeadIconButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** Defaults to the label; pass `null` when a wrapping Tooltip names it. */
  title?: string;
  color?: IconButtonProps["color"];
  /** Show the label as text beside the icon, e.g. inside a menu. */
  showLabel?: boolean;
};

export const MastHeadIconButton = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  title = label,
  color,
  showLabel = false,
}: MastHeadIconButtonProps) => {
  // With its label shown as text, the button needs no tooltip.
  const button = showLabel ? (
    <Button
      startIcon={<Icon size={MASTHEAD_ICON_SIZE} />}
      onClick={onClick}
      disabled={disabled}
      color={color === "default" ? "inherit" : (color ?? "inherit")}
      sx={{ justifyContent: "flex-start", textTransform: "none" }}
    >
      {label}
    </Button>
  ) : (
    <IconButton
      aria-label={label}
      title={title ?? undefined}
      onClick={onClick}
      disabled={disabled}
      color={color}
    >
      <Icon size={MASTHEAD_ICON_SIZE} />
    </IconButton>
  );

  return button;
};

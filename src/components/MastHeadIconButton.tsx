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
};

export const MastHeadIconButton = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  title = label,
  color,
}: MastHeadIconButtonProps) => (
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

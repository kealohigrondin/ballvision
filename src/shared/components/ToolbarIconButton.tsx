import Button from "@mui/material/Button";
import IconButton, { type IconButtonProps } from "@mui/material/IconButton";
import type { LucideIcon } from "lucide-react";

// An icon button for toolbars such as the masthead; with showLabel it becomes
// a labelled text button, e.g. inside a menu. Every toolbar control shares
// one icon size so the buttons line up.
export const TOOLBAR_ICON_SIZE = 17;

type ToolbarIconButtonProps = {
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

export const ToolbarIconButton = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  title = label,
  color,
  showLabel = false,
}: ToolbarIconButtonProps) => {
  const button = showLabel ? (
    <Button
      startIcon={<Icon size={TOOLBAR_ICON_SIZE} />}
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
      <Icon size={TOOLBAR_ICON_SIZE} />
    </IconButton>
  );

  return button;
};

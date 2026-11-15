import type { SxProps, Theme } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import type { ReactNode } from "react";

type SegmentedControlProps<Value extends string> = {
  label: string;
  value: Value;
  options: readonly { value: Value; label: ReactNode }[];
  onChange: (value: Value) => void;
  id?: string;
  className?: string;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  buttonSx?: SxProps<Theme>;
};

export const SegmentedControl = <Value extends string>({
  label,
  value,
  options,
  onChange,
  id,
  className,
  fullWidth = false,
  sx,
  buttonSx,
}: SegmentedControlProps<Value>) => {
  const buttons = options.map((option) => (
    <ToggleButton key={option.value} value={option.value} sx={buttonSx}>
      {option.label}
    </ToggleButton>
  ));

  return (
    <ToggleButtonGroup
      exclusive
      fullWidth={fullWidth}
      color="primary"
      value={value}
      onChange={(_, next: Value | null) => {
        if (next !== null) {
          onChange(next);
        }
      }}
      aria-label={label}
      id={id}
      className={className}
      sx={sx}
    >
      {buttons}
    </ToggleButtonGroup>
  );
};

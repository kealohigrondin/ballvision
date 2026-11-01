import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { controlHeightSx, segmentedButtonSx } from "../styles/shared";

type SegmentedControlProps<Value extends string> = {
  label: string;
  value: Value;
  options: readonly { value: Value; label: ReactNode }[];
  onChange: (value: Value) => void;
  className?: string;
  sx?: SxProps<Theme>;
};

export const SegmentedControl = <Value extends string>({
  label,
  value,
  options,
  onChange,
  className,
  sx = [],
}: SegmentedControlProps<Value>) => {
  const buttons = options.map((option) => (
    <Box
      component="button"
      key={option.value}
      type="button"
      aria-pressed={value === option.value}
      onClick={() => onChange(option.value)}
      sx={[segmentedButtonSx, { flex: 1 }]}
    >
      {option.label}
    </Box>
  ));

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      className={className}
      sx={[
        controlHeightSx,
        {
          gap: "5px",
          borderRadius: "28px",
          background: "var(--mui-app-colors-inputSurface)",
          overflowX: "auto",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {buttons}
    </Stack>
  );
};

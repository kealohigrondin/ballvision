import Stack from "@mui/material/Stack";
import clsx from "clsx";
import type { ReactNode } from "react";
import "./styles/SegmentedControl.css";

type SegmentedControlProps<Value extends string> = {
  label: string;
  value: Value;
  options: readonly { value: Value; label: ReactNode }[];
  onChange: (value: Value) => void;
  className?: string;
};

export const SegmentedControl = <Value extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<Value>) => {
  const buttons = options.map((option) => (
    <button
      key={option.value}
      type="button"
      className={clsx(value === option.value && "active")}
      aria-pressed={value === option.value}
      onClick={() => onChange(option.value)}
    >
      {option.label}
    </button>
  ));

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      className={clsx("filter-bar", className)}
    >
      {buttons}
    </Stack>
  );
};

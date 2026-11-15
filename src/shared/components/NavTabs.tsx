import type { SxProps, Theme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

type NavTabsProps<Value extends string> = {
  /** Accessible name for the tab list. */
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
  /** Prefix for each tab's id, e.g. "league-tab" gives "league-tab-nfl". */
  id?: string;
  /** Stretch the tabs to share the full width equally. */
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
};

// Material 3 primary tabs for switching between top-level sections, such as
// a site's main categories in its header. Arrow keys move between tabs.
export const NavTabs = <Value extends string>({
  label,
  value,
  options,
  onChange,
  id = "nav-tab",
  fullWidth = false,
  sx,
}: NavTabsProps<Value>) => (
  <Tabs
    value={value}
    onChange={(_, next: Value) => onChange(next)}
    aria-label={label}
    variant={fullWidth ? "fullWidth" : "standard"}
    sx={[
      {
        minHeight: 48,
        "& .MuiTab-root": {
          minHeight: 48,
          minWidth: 64,
          px: 2,
          fontWeight: 600,
          letterSpacing: "0.04em",
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {options.map((option) => (
      <Tab
        key={option.value}
        value={option.value}
        label={option.label}
        id={`${id}-${option.value}`}
      />
    ))}
  </Tabs>
);

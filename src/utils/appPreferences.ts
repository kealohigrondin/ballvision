import type { AppPreferences, Filter } from "../context/appDataTypes";
import type { Week } from "../data/types";

export const APP_PREFERENCES_KEY = "ballvision:app-data:v1";

export const defaultAppPreferences = (): AppPreferences => ({
  panelOpen: true,
  week: null,
  division: "fbs",
  filter: "all",
  search: "",
  paused: false,
});

const validFilter = (value: unknown): value is Filter =>
  typeof value === "string" &&
  ["all", "live", "upcoming", "final", "pinned"].includes(value);

const validWeek = (value: unknown): value is Week => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const week = value as Record<string, unknown>;
  return (
    ["id", "label", "group", "detail"].every(
      (key) => typeof week[key] === "string",
    ) &&
    ["year", "seasonType", "number"].every((key) => Number.isInteger(week[key]))
  );
};

export const loadAppPreferences = (
  storage?: Pick<Storage, "getItem">,
): AppPreferences => {
  const defaults = defaultAppPreferences();
  try {
    const raw: unknown = JSON.parse(
      (storage ?? localStorage).getItem(APP_PREFERENCES_KEY) ?? "null",
    );
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaults;
    const value = raw as Record<string, unknown>;
    if (value.version !== 1) return defaults;
    return {
      panelOpen:
        typeof value.panelOpen === "boolean"
          ? value.panelOpen
          : defaults.panelOpen,
      week: validWeek(value.week) ? value.week : defaults.week,
      division:
        value.division === "fbs" ||
        value.division === "fcs" ||
        value.division === "nfl"
          ? value.division
          : defaults.division,
      filter: validFilter(value.filter) ? value.filter : defaults.filter,
      search: typeof value.search === "string" ? value.search : defaults.search,
      paused:
        typeof value.paused === "boolean" ? value.paused : defaults.paused,
    };
  } catch {
    return defaults;
  }
};

export const saveAppPreferences = (
  preferences: AppPreferences,
  storage?: Pick<Storage, "setItem">,
) => {
  try {
    (storage ?? localStorage).setItem(
      APP_PREFERENCES_KEY,
      JSON.stringify({ version: 1, ...preferences }),
    );
  } catch {
    /* Preferences remain usable when storage is unavailable. */
  }
};

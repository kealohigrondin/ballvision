import type { AppPreferences, Filter } from "../context/appDataTypes";
import { localDate } from "./date";

export const APP_PREFERENCES_KEY = "ballvision:app-data:v1";
export const defaultAppPreferences = (): AppPreferences => ({
  panelOpen: true,
  date: localDate(),
  division: "fbs",
  filter: "all",
  search: "",
  paused: false,
});
const validFilter = (value: unknown): value is Filter =>
  typeof value === "string" &&
  ["all", "live", "upcoming", "final", "pinned"].includes(value);
const validDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^(20\d{2})-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDate(date) === value;
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
      date: validDate(value.date) ? value.date : defaults.date,
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

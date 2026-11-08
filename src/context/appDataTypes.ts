import type { Division } from "../data/types";

export type Filter = "all" | "live" | "upcoming" | "final" | "pinned";
export type AppPreferences = {
  panelOpen: boolean;
  date: string;
  division: Division;
  filter: Filter;
  search: string;
  paused: boolean;
};

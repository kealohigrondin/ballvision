import type { Division, League, Sport } from "./types";

/** Masthead tab order. */
export const leagues: readonly League[] = ["ncaaf", "nfl", "epl", "ucl"];

/** The divisions offered inside college football. */
export const collegeDivisions = ["fbs", "fcs"] as const;

const divisionLeague: Record<Division, League> = {
  fbs: "ncaaf",
  fcs: "ncaaf",
  nfl: "nfl",
  epl: "epl",
  ucl: "ucl",
};

const divisionSport: Record<Division, Sport> = {
  fbs: "football",
  fcs: "football",
  nfl: "football",
  epl: "soccer",
  ucl: "soccer",
};

export const leagueOf = (division: Division): League =>
  divisionLeague[division];

export const sportOf = (division: Division): Sport => divisionSport[division];

/** Only college football has Top 25 polls. */
export const hasRankings = (division: Division): boolean =>
  leagueOf(division) === "ncaaf";

export const isDivision = (value: unknown): value is Division =>
  typeof value === "string" && value in divisionLeague;

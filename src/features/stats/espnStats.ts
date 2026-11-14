import {
  espnSport,
  fetchEspnJson,
  list,
  number,
  obj,
  str,
} from "@/shared/api/espn";

import type {
  TeamStat,
  TeamStatCategory,
  TeamStats,
  TeamStatsSource,
} from "./types";

const parseStat = (raw: unknown): TeamStat => {
  const stat = obj(raw);
  const name = str(stat.name);
  const perGameDisplayValue = str(stat.perGameDisplayValue);

  return {
    name,
    label: str(stat.displayName, name),
    abbreviation: str(stat.abbreviation, str(stat.shortDisplayName)),
    description: str(stat.description),
    value: number(stat.value),
    displayValue: str(stat.displayValue, "—"),
    perGameValue: number(stat.perGameValue),
    perGameDisplayValue: perGameDisplayValue || undefined,
  };
};

const parseCategory = (raw: unknown): TeamStatCategory => {
  const category = obj(raw);
  const name = str(category.name);

  return {
    name,
    label: str(category.displayName, name),
    stats: list(category.stats)
      .map(parseStat)
      .filter((stat) => stat.name),
  };
};

// ESPN's team statistics payload: season totals grouped into categories
// such as passing, rushing and defense.
export const parseTeamStats = (payload: unknown, teamId: string): TeamStats => {
  const root = obj(payload);
  const stats = obj(obj(root.results).stats);
  if (!Array.isArray(stats.categories)) {
    throw new Error("Unexpected ESPN team statistics response.");
  }
  const season = obj(root.season);

  return {
    teamId: str(obj(root.team).id, teamId),
    season: str(season.displayName, str(season.year, "Current season")),
    categories: stats.categories
      .map(parseCategory)
      .filter((category) => category.name && category.stats.length > 0),
  };
};

export const espnTeamStatsSource: TeamStatsSource = {
  load: async ({ division, teamId }, signal) => {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/${espnSport(division)}/teams/${encodeURIComponent(teamId)}/statistics`;

    return parseTeamStats(await fetchEspnJson(url, signal), teamId);
  },
};

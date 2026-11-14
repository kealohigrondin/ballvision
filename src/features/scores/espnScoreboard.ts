import {
  espnSport,
  fetchEspnJson,
  integer,
  list,
  obj,
  parseScoreboard,
  str,
} from "@/shared/api/espn";
import type { Division, Week } from "@/shared/types";

import { withGameLeaders } from "./espnLeaders";
import type { ScoreboardSource, SeasonCalendar } from "./types";

export const parseCalendar = (payload: unknown): SeasonCalendar => {
  const root = obj(payload);
  const league = obj(list(root.leagues)[0]);
  const season = obj(root.season ?? league.season);
  const year = integer(season.year);
  if (year === undefined) {
    return { weeks: [] };
  }
  const weeks = list(league.calendar)
    .map(obj)
    .flatMap((seasonType): Week[] => {
      const type = integer(seasonType.value);
      if (type === undefined) {
        return [];
      }

      return list(seasonType.entries)
        .map(obj)
        .flatMap((entry): Week[] => {
          const weekNumber = integer(entry.value);
          if (weekNumber === undefined) {
            return [];
          }

          return [
            {
              id: `${year}-${type}-${weekNumber}`,
              label: str(entry.label, `Week ${weekNumber}`),
              group: str(seasonType.label),
              detail: str(entry.detail),
              year,
              seasonType: type,
              number: weekNumber,
            },
          ];
        });
    });
  const currentWeekId = `${year}-${str(season.type)}-${str(obj(root.week).number)}`;

  return {
    weeks,
    currentWeekId: weeks.some((week) => week.id === currentWeekId)
      ? currentWeekId
      : undefined,
  };
};

const scoreboardUrl = (division: Division, params: Record<string, string>) => {
  const url = new URL(
    `https://site.api.espn.com/apis/site/v2/sports/football/${espnSport(division)}/scoreboard`,
  );
  url.search = new URLSearchParams({
    ...(division !== "nfl" && {
      groups: division === "fbs" ? "80" : "81",
    }),
    ...params,
  }).toString();

  return url;
};

export const espnSource: ScoreboardSource = {
  load: async ({ division, week }, signal) => {
    const url = scoreboardUrl(division, {
      // Larger limits fall back to ESPN's default 25-game response.
      limit: "100",
      // Without a week, ESPN returns its current week.
      ...(week && {
        dates: String(week.year),
        seasontype: String(week.seasonType),
        week: String(week.number),
      }),
    });

    const payload = await fetchEspnJson(url, signal);

    return withGameLeaders(payload, parseScoreboard(payload));
  },
  // Every scoreboard response carries the season calendar, so the smallest
  // slate is enough to list the selectable weeks.
  loadCalendar: async (division, signal) =>
    parseCalendar(
      await fetchEspnJson(scoreboardUrl(division, { limit: "1" }), signal),
    ),
};

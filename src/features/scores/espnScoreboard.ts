import {
  espnLeaguePath,
  fetchEspnJson,
  integer,
  type Json,
  list,
  obj,
  parseScoreboard,
  str,
} from "@/shared/api/espn";
import { sportOf } from "@/shared/leagues";
import type { Division, Week } from "@/shared/types";

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

// ESPN only lists soccer by day or by month, so a soccer "week" is a month:
// one request covers every match in it.
const monthKey = (year: number, month: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

const monthWeek = (year: number, month: number, group: string): Week => ({
  id: monthKey(year, month),
  label: new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year, month - 1, 1)),
  group,
  detail: "",
  year,
  seasonType: 0,
  number: month,
});

// Calendar months from the first date to the last, inclusive.
const monthsBetween = (first: Date, last: Date): [number, number][] => {
  const months: [number, number][] = [];
  const cursor = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1),
  );
  while (cursor <= last && months.length < 24) {
    months.push([cursor.getUTCFullYear(), cursor.getUTCMonth() + 1]);
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return months;
};

/**
 * Soccer calendars list match days (Premier League) or competition stages
 * with date ranges (Champions League). Either way, the selectable weeks are
 * the months that hold them; the current one is this month, or the next
 * month with matches.
 */
export const parseMonthCalendar = (
  payload: unknown,
  now: Date = new Date(),
): SeasonCalendar => {
  const league = obj(list(obj(payload).leagues)[0]);
  const group = str(obj(league.season).displayName);
  const DAY = 24 * 60 * 60 * 1000;

  // Stage ranges end early on the morning after their last day.
  const range = (stage: Json) => [
    Date.parse(str(stage.startDate)),
    Date.parse(str(stage.endDate)) - DAY,
  ];
  const times = list(league.calendar)
    .flatMap((entry) => {
      if (typeof entry === "string") {
        return [Date.parse(entry)];
      }
      const stages = list(obj(entry).entries).map(obj);

      return stages.length > 0 ? stages.flatMap(range) : range(obj(entry));
    })
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (times.length === 0) {
    return { weeks: [] };
  }
  // Day lists name only match days; stage ranges cover every day between.
  const matchMonths = new Set(
    typeof list(league.calendar)[0] === "string"
      ? times.map((time) => {
          const date = new Date(time);

          return monthKey(date.getUTCFullYear(), date.getUTCMonth() + 1);
        })
      : undefined,
  );
  const weeks = monthsBetween(new Date(times[0]), new Date(times.at(-1) ?? 0))
    .filter(
      ([year, month]) =>
        matchMonths.size === 0 || matchMonths.has(monthKey(year, month)),
    )
    .map(([year, month]) => monthWeek(year, month, group));
  const thisMonth = monthKey(now.getFullYear(), now.getMonth() + 1);
  const current = weeks.find((week) => week.id >= thisMonth) ?? weeks.at(-1);

  return { weeks, currentWeekId: current?.id };
};

const collegeGroups: Partial<Record<Division, string>> = {
  fbs: "80",
  fcs: "81",
};

const scoreboardUrl = (division: Division, params: Record<string, string>) => {
  const url = new URL(
    `https://site.api.espn.com/apis/site/v2/sports/${espnLeaguePath(division)}/scoreboard`,
  );
  const groups = collegeGroups[division];
  url.search = new URLSearchParams({
    ...(groups && { groups }),
    ...params,
  }).toString();

  return url;
};

// Football weeks are ESPN calendar weeks; soccer weeks are months, and
// without one ESPN would return a single day, so soccer asks for this month.
const weekParams = (
  division: Division,
  week: Week | null,
): Record<string, string> => {
  if (sportOf(division) === "soccer") {
    const now = new Date();
    const [year, month] = week
      ? [week.year, week.number]
      : [now.getFullYear(), now.getMonth() + 1];

    return { dates: monthKey(year, month).replace("-", "") };
  }

  // Without a week, ESPN returns its current week.
  return week
    ? {
        dates: String(week.year),
        seasontype: String(week.seasonType),
        week: String(week.number),
      }
    : {};
};

export const espnSource: ScoreboardSource = {
  load: async ({ division, week }, signal) => {
    const url = scoreboardUrl(division, {
      // Larger limits fall back to ESPN's default 25-game response.
      limit: "100",
      ...weekParams(division, week),
    });

    return parseScoreboard(await fetchEspnJson(url, signal));
  },
  // Every scoreboard response carries the season calendar, so the smallest
  // slate is enough to list the selectable weeks.
  loadCalendar: async (division, signal) => {
    const payload = await fetchEspnJson(
      scoreboardUrl(division, { limit: "1" }),
      signal,
    );

    return sportOf(division) === "soccer"
      ? parseMonthCalendar(payload)
      : parseCalendar(payload);
  },
};

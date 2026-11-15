import { copy } from "@/copy";
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
import type { Division, Game, Week } from "@/shared/types";

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

// ESPN lists soccer only by day, month or year, and has no matchweeks, so
// soccer weeks are built here: Tuesday-to-Monday windows (like college
// football's) that hold at least one match, numbered within each stage.
const DAY = 24 * 60 * 60 * 1000;

const isoDay = (time: number) => new Date(time).toISOString().slice(0, 10);

// Midnight UTC on the Tuesday on or before a time.
const tuesdayBefore = (time: number) => {
  const date = new Date(time);
  const day = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  return day - ((date.getUTCDay() + 5) % 7) * DAY;
};

// ESPN's football week format: "Nov 10-16", or "Oct 27-Nov 2" across months.
const weekDetail = (start: number) => {
  const end = start + 6 * DAY;

  const format = (time: number, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(undefined, { ...options, timeZone: "UTC" }).format(
      time,
    );
  const sameMonth =
    new Date(start).getUTCMonth() === new Date(end).getUTCMonth();

  return `${format(start, { month: "short", day: "numeric" })}-${format(
    end,
    sameMonth ? { day: "numeric" } : { month: "short", day: "numeric" },
  )}`;
};

type Stage = { label: string; start: number; end: number };

// Champions League stages (League Phase, Round of 16, ...) with their date
// ranges; the Premier League is one stage named for its season.
const calendarStages = (league: Json): Stage[] => {
  const stages = list(league.calendar)
    .flatMap((entry) => list(obj(entry).entries))
    .map(obj)
    .map((stage) => ({
      label: str(stage.label),
      start: Date.parse(str(stage.startDate)),
      end: Date.parse(str(stage.endDate)),
    }))
    .filter((stage) => Number.isFinite(stage.start + stage.end));

  return stages.length > 0
    ? stages
    : [
        {
          label: str(obj(league.season).displayName),
          start: -Infinity,
          end: Infinity,
        },
      ];
};

const scoreboardLeague = (payload: unknown): Json =>
  obj(list(obj(payload).leagues)[0]);

/** The Premier League's calendar lists its match days; others list none. */
export const calendarMatchDays = (payload: unknown): string[] =>
  list(scoreboardLeague(payload).calendar).filter(
    (entry): entry is string => typeof entry === "string",
  );

/**
 * Soccer weeks for the given match days: every Tuesday-to-Monday window with
 * a match, numbered from 1 within each stage and grouped by stage. The
 * current week is this week, or the next one with matches.
 */
export const parseMatchweekCalendar = (
  payload: unknown,
  matchDays: readonly string[],
  now: Date = new Date(),
): SeasonCalendar => {
  const league = scoreboardLeague(payload);
  const stages = calendarStages(league);
  // Year queries also return the previous season's matches.
  const season = obj(league.season);
  const seasonStart = Date.parse(str(season.startDate)) || -Infinity;
  const seasonEnd = Date.parse(str(season.endDate)) || Infinity;
  const starts = [
    ...new Set(
      matchDays
        .map((day) => Date.parse(day))
        .filter((time) => time >= seasonStart && time < seasonEnd)
        .map(tuesdayBefore),
    ),
  ].sort((a, b) => a - b);
  const numbers = new Map<string, number>();
  const weeks = starts.map((start): Week => {
    const index = stages.findIndex(
      (stage) => start + 6 * DAY >= stage.start && start < stage.end,
    );
    const stage = stages[index] ?? stages[0];
    const number = (numbers.get(stage.label) ?? 0) + 1;
    numbers.set(stage.label, number);

    return {
      id: isoDay(start),
      label: copy.week.matchweek(number),
      group: stage.label,
      detail: weekDetail(start),
      year: new Date(start).getUTCFullYear(),
      seasonType: Math.max(index, 0) + 1,
      number,
      start: isoDay(start),
    };
  });
  const thisWeek = isoDay(tuesdayBefore(now.getTime()));
  const current = weeks.find((week) => week.id >= thisWeek) ?? weeks.at(-1);

  return { weeks, currentWeekId: current?.id };
};

// The calendar years a season spans, e.g. 2026 and 2027 for 2026-27.
const seasonYears = (payload: unknown): string[] => {
  const season = obj(scoreboardLeague(payload).season);
  const years = [str(season.startDate), str(season.endDate)]
    .map((date) => Date.parse(date))
    .filter(Number.isFinite)
    .map((time) => new Date(time).getUTCFullYear());

  return [...new Set(years)].map(String);
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

// Without a week, ESPN returns its current football week.
const footballWeekParams = (week: Week | null): Record<string, string> =>
  week
    ? {
        dates: String(week.year),
        seasontype: String(week.seasonType),
        week: String(week.number),
      }
    : {};

const fetchEvents = async (
  division: Division,
  dates: string,
  signal: AbortSignal,
): Promise<unknown[]> =>
  list(
    obj(
      await fetchEspnJson(
        scoreboardUrl(division, { dates, limit: "1000" }),
        signal,
      ),
    ).events,
  );

// A soccer week's matches: the month or two it spans, filtered to the week.
// Without a chosen week, this week's.
const loadSoccerWeek = async (
  division: Division,
  week: Week | null,
  signal: AbortSignal,
): Promise<Game[]> => {
  const start = week?.start
    ? Date.parse(week.start)
    : tuesdayBefore(Date.now());
  const end = start + 7 * DAY;
  const months = [
    ...new Set([start, end - 1].map((time) => isoDay(time).slice(0, 7))),
  ].map((month) => month.replace("-", ""));
  const events = (
    await Promise.all(
      months.map((month) => fetchEvents(division, month, signal)),
    )
  )
    .flat()
    .filter((event) => {
      const time = Date.parse(str(obj(event).date));

      return time >= start && time < end;
    });
  const unique = [
    ...new Map(events.map((event) => [str(obj(event).id), event])).values(),
  ];

  return parseScoreboard({ events: unique });
};

// The Champions League calendar lists only stage ranges, so its match days
// come from the season's matches, fetched by calendar year.
const loadMatchDays = async (
  division: Division,
  payload: unknown,
  signal: AbortSignal,
): Promise<string[]> => {
  const listed = calendarMatchDays(payload);
  if (listed.length > 0) {
    return listed;
  }
  const events = await Promise.all(
    seasonYears(payload).map((year) => fetchEvents(division, year, signal)),
  );

  return events.flat().map((event) => str(obj(event).date));
};

export const espnSource: ScoreboardSource = {
  load: async ({ division, week }, signal) => {
    if (sportOf(division) === "soccer") {
      return loadSoccerWeek(division, week, signal);
    }
    const url = scoreboardUrl(division, {
      // Larger limits fall back to ESPN's default 25-game response.
      limit: "100",
      ...footballWeekParams(week),
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
    if (sportOf(division) !== "soccer") {
      return parseCalendar(payload);
    }

    return parseMatchweekCalendar(
      payload,
      await loadMatchDays(division, payload, signal),
    );
  },
};

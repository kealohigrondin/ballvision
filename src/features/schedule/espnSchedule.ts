import {
  espnLeaguePath,
  fetchEspnJson,
  list,
  obj,
  parseScoreboard,
  str,
} from "@/shared/api/espn";
import { sportOf } from "@/shared/leagues";
import type { Division } from "@/shared/types";

import type { TeamSchedule, TeamScheduleSource } from "./types";

export const parseTeamSchedule = (
  payload: unknown,
  teamId: string,
): TeamSchedule => {
  const root = obj(payload);
  const metadata = new Map(
    list(root.events).map((raw) => {
      const event = obj(raw);
      const competition = obj(list(event.competitions)[0]);

      return [
        str(event.id),
        {
          timeConfirmed:
            event.timeValid !== false && competition.timeValid !== false,
          neutralSite: competition.neutralSite === true,
        },
      ];
    }),
  );
  const games = parseScoreboard(payload)
    .filter((game) => game.home.id === teamId || game.away.id === teamId)
    .map((game) => ({
      ...game,
      timeConfirmed: true,
      neutralSite: false,
      ...metadata.get(game.id),
    }))
    .sort((a, b) => (Date.parse(a.start) || 0) - (Date.parse(b.start) || 0));

  return {
    season: str(
      obj(root.season).displayName,
      str(obj(root.season).year, "Current season"),
    ),
    games,
  };
};

const mergeSchedules = (schedules: TeamSchedule[]): TeamSchedule => ({
  ...schedules[0],
  games: [
    ...new Map(
      schedules.flatMap((s) => s.games).map((game) => [game.id, game]),
    ).values(),
  ].sort((a, b) => (Date.parse(a.start) || 0) - (Date.parse(b.start) || 0)),
});

const teamScheduleUrl = (division: Division, teamId: string): URL =>
  new URL(
    `https://site.api.espn.com/apis/site/v2/sports/${espnLeaguePath(division)}/teams/${encodeURIComponent(teamId)}/schedule`,
  );

// Football: the regular season, then the postseason once the season is known.
const loadFootballSchedule = async (
  division: Division,
  teamId: string,
  signal: AbortSignal,
): Promise<TeamSchedule> => {
  const url = teamScheduleUrl(division, teamId);
  url.searchParams.set("seasontype", "2");
  const regular = await fetchEspnJson(url.toString(), signal);
  const schedule = parseTeamSchedule(regular, teamId);
  const season = str(obj(obj(regular).season).year);
  if (!/^\d{4}$/.test(season)) {
    return schedule;
  }
  url.searchParams.set("season", season);
  url.searchParams.set("seasontype", "3");
  const postseason = parseTeamSchedule(
    await fetchEspnJson(url.toString(), signal),
    teamId,
  );

  return mergeSchedules([schedule, postseason]);
};

// Soccer: ESPN lists played matches and upcoming fixtures separately.
const loadSoccerSchedule = async (
  division: Division,
  teamId: string,
  signal: AbortSignal,
): Promise<TeamSchedule> => {
  const results = teamScheduleUrl(division, teamId);
  const fixtures = teamScheduleUrl(division, teamId);
  fixtures.searchParams.set("fixture", "true");
  const payloads = await Promise.all([
    fetchEspnJson(results.toString(), signal),
    fetchEspnJson(fixtures.toString(), signal),
  ]);

  return mergeSchedules(
    payloads.map((payload) => parseTeamSchedule(payload, teamId)),
  );
};

export const espnTeamScheduleSource: TeamScheduleSource = {
  load: ({ division, teamId }, signal) =>
    sportOf(division) === "soccer"
      ? loadSoccerSchedule(division, teamId, signal)
      : loadFootballSchedule(division, teamId, signal),
};

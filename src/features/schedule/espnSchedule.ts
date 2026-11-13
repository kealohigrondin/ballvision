import {
  espnSport,
  fetchEspnJson,
  list,
  obj,
  parseScoreboard,
  str,
} from "@/shared/api/espn";

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

export const espnTeamScheduleSource: TeamScheduleSource = {
  load: async ({ division, teamId }, signal) => {
    const sport = espnSport(division);
    const url = new URL(
      `https://site.api.espn.com/apis/site/v2/sports/football/${sport}/teams/${encodeURIComponent(teamId)}/schedule`,
    );
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
    const games = [
      ...new Map(
        [...schedule.games, ...postseason.games].map((game) => [game.id, game]),
      ).values(),
    ].sort((a, b) => (Date.parse(a.start) || 0) - (Date.parse(b.start) || 0));

    return { ...schedule, games };
  },
};

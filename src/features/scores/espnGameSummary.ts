import {
  espnLeaguePath,
  fetchEspnJson,
  type Json,
  list,
  obj,
  str,
} from "@/shared/api/espn";

import type {
  GameLeader,
  GameSummary,
  GameSummarySource,
  LeaderCategory,
  ScoringPlay,
  TeamStatKey,
  TeamStatLine,
} from "./types";

// ESPN's leader category names, in the order they are shown.
const leaderCategories: readonly (readonly [string, LeaderCategory])[] = [
  ["passingYards", "passing"],
  ["rushingYards", "rushing"],
  ["receivingYards", "receiving"],
];

const HEADSHOT_PATH =
  /^https:\/\/a\.espncdn\.com(\/i\/headshots\/[\w/.-]+\.png)$/;

// ESPN headshots are about 230 KB at full size; its image service returns a
// 96×70 copy of about 9 KB.
export const headshotThumbnail = (url: string): string | undefined => {
  const path = HEADSHOT_PATH.exec(url)?.[1];

  return path
    ? `https://a.espncdn.com/combiner/i?img=${path}&w=96&h=70`
    : undefined;
};

/** One team's passing, rushing and receiving leaders from ESPN's summary. */
export const parseTeamLeaders = (group: Json): GameLeader[] => {
  const team = str(obj(group.team).abbreviation);
  const categories = list(group.leaders).map(obj);

  return leaderCategories.flatMap(([name, category]) => {
    const entry = categories.find((item) => item.name === name);
    const leader = obj(list(entry?.leaders)[0]);
    const athlete = obj(leader.athlete);
    const playerName = str(athlete.shortName, str(athlete.displayName));
    const stats = str(leader.displayValue);
    if (!playerName || !stats) {
      return [];
    }
    // The summary nests the headshot URL; the scoreboard gives it directly.
    const headshot = headshotThumbnail(
      str(obj(athlete.headshot).href, str(athlete.headshot)),
    );

    return [
      {
        category,
        id: str(athlete.id),
        name: playerName,
        position: str(obj(athlete.position).abbreviation),
        jersey: str(athlete.jersey),
        team,
        ...(headshot && { headshot }),
        stats,
      },
    ];
  });
};

// "2-10" (made-attempts) as a rate, so 0 attempts compares as 0.
const conversionRate = (text: string): number => {
  const [made, attempts] = text.split("-").map(Number);

  return attempts ? made / attempts : 0;
};

// "27:13" as seconds.
const clockSeconds = (text: string): number => {
  const [minutes, seconds] = text.split(":").map(Number);

  return (minutes || 0) * 60 + (seconds || 0);
};

type StatSpec = {
  key: TeamStatKey;
  espnName: string;
  display: (text: string) => string;
  value: (text: string) => number;
};

// The team stats shown, in order, with how ESPN's text is displayed and
// compared. Penalties compare by yards; conversions by success rate.
const statSpecs: readonly StatSpec[] = [
  { key: "totalYards", espnName: "totalYards", display: String, value: Number },
  { key: "turnovers", espnName: "turnovers", display: String, value: Number },
  { key: "firstDowns", espnName: "firstDowns", display: String, value: Number },
  {
    key: "penalties",
    espnName: "totalPenaltiesYards",
    display: String,
    value: (text) => Number(text.split("-")[1]) || 0,
  },
  {
    key: "thirdDown",
    espnName: "thirdDownEff",
    display: (text) => text.replace("-", "/"),
    value: conversionRate,
  },
  {
    key: "fourthDown",
    espnName: "fourthDownEff",
    display: (text) => text.replace("-", "/"),
    value: conversionRate,
  },
  {
    key: "possession",
    espnName: "possessionTime",
    display: String,
    value: clockSeconds,
  },
];

/** Both teams' stats from ESPN's box score, in display order. */
export const parseTeamStats = (
  payload: unknown,
  awayId: string,
  homeId: string,
): TeamStatLine[] => {
  const teams = list(obj(obj(payload).boxscore).teams).map(obj);

  const statsFor = (teamId: string) =>
    list(
      teams.find((team) => str(obj(team.team).id) === teamId)?.statistics,
    ).map(obj);
  const away = statsFor(awayId);
  const home = statsFor(homeId);
  if (!away.length || !home.length) {
    return [];
  }

  return statSpecs.flatMap((spec) => {
    const text = (stats: Json[]) =>
      str(stats.find((stat) => stat.name === spec.espnName)?.displayValue);
    const awayText = text(away);
    const homeText = text(home);
    if (!awayText || !homeText) {
      return [];
    }

    return [
      {
        key: spec.key,
        away: spec.display(awayText),
        home: spec.display(homeText),
        awayValue: Math.max(0, spec.value(awayText) || 0),
        homeValue: Math.max(0, spec.value(homeText) || 0),
      },
    ];
  });
};

/** Both teams' scoring plays from ESPN's summary, in the order they happened. */
export const parseScoringPlays = (
  payload: unknown,
  awayId: string,
  homeId: string,
): ScoringPlay[] =>
  list(obj(payload).scoringPlays)
    .map(obj)
    .flatMap((play) => {
      const teamId = str(obj(play.team).id);
      const side =
        teamId === awayId ? "away" : teamId === homeId ? "home" : undefined;
      const text = str(play.text).trim();
      if (!side || !text) {
        return [];
      }
      const type = obj(play.scoringType);

      return [
        {
          id: str(play.id),
          side,
          period: Number(obj(play.period).number) || 0,
          clock: str(obj(play.clock).displayValue),
          type: str(type.abbreviation, str(obj(play.type).abbreviation)),
          text,
          awayScore: Number(play.awayScore) || 0,
          homeScore: Number(play.homeScore) || 0,
        },
      ];
    });

/** Each team's leaders and both teams' stats from ESPN's game summary. */
export const parseGameSummary = (
  payload: unknown,
  awayId: string,
  homeId: string,
): GameSummary => {
  const groups = list(obj(payload).leaders).map(obj);

  const leadersFor = (teamId: string) => {
    const group = groups.find((item) => str(obj(item.team).id) === teamId);

    return group ? parseTeamLeaders(group) : [];
  };

  return {
    leaders: { away: leadersFor(awayId), home: leadersFor(homeId) },
    stats: parseTeamStats(payload, awayId, homeId),
    scoringPlays: parseScoringPlays(payload, awayId, homeId),
  };
};

export const espnGameSummarySource: GameSummarySource = {
  load: async ({ division, gameId, awayId, homeId }, signal) => {
    const url = new URL(
      `https://site.api.espn.com/apis/site/v2/sports/${espnLeaguePath(division)}/summary`,
    );
    url.searchParams.set("event", gameId);

    return parseGameSummary(await fetchEspnJson(url, signal), awayId, homeId);
  },
};

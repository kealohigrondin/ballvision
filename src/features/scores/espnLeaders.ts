import { type Json, list, obj, str } from "@/shared/api/espn";
import type { Game, GameLeader, LeaderCategory } from "@/shared/types";

// ESPN's leader category names, in the order they are shown.
const categories: readonly (readonly [string, LeaderCategory])[] = [
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

/** Passing, rushing and receiving leaders from one ESPN competition. */
export const parseGameLeaders = (
  competition: Json,
  game: Game,
): GameLeader[] => {
  const groups = list(competition.leaders).map(obj);

  const teamAbbreviation = (teamId: string) =>
    [game.away, game.home].find((team) => team.id === teamId)?.abbreviation ??
    "";

  return categories.flatMap(([name, category]) => {
    const group = groups.find((entry) => entry.name === name);
    const leader = obj(list(group?.leaders)[0]);
    const athlete = obj(leader.athlete);
    const playerName = str(athlete.shortName, str(athlete.displayName));
    const stats = str(leader.displayValue);
    if (!playerName || !stats) {
      return [];
    }
    const headshot = headshotThumbnail(str(athlete.headshot));

    return [
      {
        category,
        id: str(athlete.id),
        name: playerName,
        position: str(obj(athlete.position).abbreviation),
        jersey: str(athlete.jersey),
        team: teamAbbreviation(
          str(obj(leader.team).id, str(obj(athlete.team).id)),
        ),
        ...(headshot && { headshot }),
        stats,
      },
    ];
  });
};

/**
 * Adds each game's leaders from the same scoreboard payload. Before kickoff
 * ESPN lists season leaders instead, so upcoming games get none.
 */
export const withGameLeaders = (payload: unknown, games: Game[]): Game[] => {
  const competitions = new Map(
    list(obj(payload).events)
      .map(obj)
      .map((event) => [str(event.id), obj(list(event.competitions)[0])]),
  );

  return games.map((game) => {
    const competition = competitions.get(game.id);
    if (!competition || (game.state !== "live" && game.state !== "final")) {
      return game;
    }

    return { ...game, leaders: parseGameLeaders(competition, game) };
  });
};

import type {
  FantasyLeague,
  FantasyPlayer,
  FantasyQuery,
  FantasySource,
} from "./types";

type Json = Record<string, unknown>;
export type SleeperLeague = { id: string; name: string };
export type SleeperPlayerInfo = {
  name: string;
  position: string;
  team: string;
};
export type PlayerDirectory = Record<string, SleeperPlayerInfo>;

const BASE_URL = "https://api.sleeper.app/v1";
export const PLAYER_DIRECTORY_KEY = "ballvision:sleeper-players:v1";
// Sleeper asks apps to fetch its player list at most once a day.
const PLAYER_DIRECTORY_MAX_AGE = 24 * 60 * 60 * 1000;

const obj = (value: unknown): Json =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const text = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

const strings = (value: unknown) => list(value).map(text).filter(Boolean);

// Sleeper and ESPN agree on every NFL team abbreviation except Washington's.
const espnTeams: Readonly<Record<string, string>> = { WAS: "WSH" };

export const toEspnTeam = (team: string) => espnTeams[team] ?? team;

export const parseUserId = (payload: unknown) => text(obj(payload).user_id);

// Leagues still playing games; drafting and finished leagues have no points.
export const parseActiveLeagues = (payload: unknown): SleeperLeague[] =>
  list(payload)
    .map(obj)
    .filter(
      (league) =>
        league.status === "in_season" || league.status === "post_season",
    )
    .map((league) => ({ id: text(league.league_id), name: text(league.name) }))
    .filter((league) => league.id);

export const findRosterId = (rosters: unknown, userId: string) => {
  const roster = list(rosters)
    .map(obj)
    .find(
      (row) =>
        text(row.owner_id) === userId ||
        strings(row.co_owners).includes(userId),
    );

  return roster ? text(roster.roster_id) : "";
};

// Every player id on one fantasy team's matchup, starters first.
export const parseMatchupPlayerIds = (matchups: unknown, rosterId: string) => {
  const team = list(matchups)
    .map(obj)
    .find((row) => text(row.roster_id) === rosterId);
  if (!team) {
    return [];
  }
  const starters = strings(team.starters).filter((id) => id !== "0");

  return [
    ...starters,
    ...strings(team.players).filter((id) => !starters.includes(id)),
  ];
};

export const parseFantasyPlayers = (
  matchups: unknown,
  rosterId: string,
  directory: PlayerDirectory,
): FantasyPlayer[] => {
  const team = list(matchups)
    .map(obj)
    .find((row) => text(row.roster_id) === rosterId);
  const starters = strings(team?.starters);
  const points = obj(team?.players_points);

  return parseMatchupPlayerIds(matchups, rosterId).flatMap((id) => {
    const info = directory[id];
    if (!info) {
      return [];
    }
    const value = points[id];

    return [
      {
        id,
        ...info,
        points: typeof value === "number" ? value : 0,
        starter: starters.includes(id),
      },
    ];
  });
};

// Names, positions and teams for the given player ids from Sleeper's
// player list. Team defenses are listed by city and nickname.
export const parsePlayerDirectory = (
  payload: unknown,
  ids: readonly string[],
): PlayerDirectory => {
  const players = obj(payload);

  return Object.fromEntries(
    ids.flatMap((id) => {
      const player = obj(players[id]);
      const name =
        text(player.full_name) ||
        [text(player.first_name), text(player.last_name)]
          .filter(Boolean)
          .join(" ");
      if (!name) {
        return [];
      }

      return [
        [
          id,
          {
            name,
            position: text(player.position),
            team: toEspnTeam(text(player.team)),
          },
        ],
      ];
    }),
  );
};

type StoredDirectory = { savedAt: number; players: PlayerDirectory };

export const readStoredDirectory = (
  storage: Pick<Storage, "getItem">,
): StoredDirectory | undefined => {
  try {
    const raw = obj(
      JSON.parse(storage.getItem(PLAYER_DIRECTORY_KEY) ?? "null"),
    );

    return typeof raw.savedAt === "number"
      ? { savedAt: raw.savedAt, players: obj(raw.players) as PlayerDirectory }
      : undefined;
  } catch {
    return undefined;
  }
};

// Whether the stored players can answer for these ids without downloading
// Sleeper's full list again.
export const directoryIsCurrent = (
  stored: StoredDirectory | undefined,
  ids: readonly string[],
  now: number,
): stored is StoredDirectory =>
  stored !== undefined &&
  now - stored.savedAt < PLAYER_DIRECTORY_MAX_AGE &&
  ids.every((id) => id in stored.players);

const getJson = async (path: string, signal: AbortSignal) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Sleeper returned HTTP ${response.status}.`);
  }

  return response.json() as Promise<unknown>;
};

// Keeps only the players on the user's rosters in browser storage. The full
// list (about 2 MB) is downloaded only when that copy is a day old or a
// roster has a player it doesn't know yet.
const loadPlayerDirectory = async (
  ids: readonly string[],
  signal: AbortSignal,
): Promise<PlayerDirectory> => {
  let stored: StoredDirectory | undefined;

  try {
    stored = readStoredDirectory(localStorage);
  } catch {
    stored = undefined;
  }
  const now = Date.now();
  if (directoryIsCurrent(stored, ids, now)) {
    return stored.players;
  }
  const players = parsePlayerDirectory(
    await getJson("/players/nfl?active=true", signal),
    ids,
  );

  try {
    localStorage.setItem(
      PLAYER_DIRECTORY_KEY,
      JSON.stringify({ savedAt: now, players }),
    );
  } catch {
    /* Players still load when storage is unavailable. */
  }

  return players;
};

const loadLeagueTeam = async (
  league: SleeperLeague,
  userId: string,
  week: number,
  signal: AbortSignal,
) => {
  const [rosters, matchups] = await Promise.all([
    getJson(`/league/${league.id}/rosters`, signal),
    getJson(`/league/${league.id}/matchups/${week}`, signal),
  ]);

  return { league, matchups, rosterId: findRosterId(rosters, userId) };
};

export const sleeperSource: FantasySource = {
  load: async ({ username, season, week }: FantasyQuery, signal) => {
    const userId = parseUserId(
      await getJson(`/user/${encodeURIComponent(username)}`, signal),
    );
    if (!userId) {
      return [];
    }
    const leagues = parseActiveLeagues(
      await getJson(`/user/${userId}/leagues/nfl/${season}`, signal),
    );
    const teams = (
      await Promise.all(
        leagues.map((league) => loadLeagueTeam(league, userId, week, signal)),
      )
    ).filter((team) => team.rosterId);
    const ids = [
      ...new Set(
        teams.flatMap((team) =>
          parseMatchupPlayerIds(team.matchups, team.rosterId),
        ),
      ),
    ];
    const directory = await loadPlayerDirectory(ids, signal);

    return teams.map(({ league, matchups, rosterId }): FantasyLeague => ({
      ...league,
      players: parseFantasyPlayers(matchups, rosterId, directory),
    }));
  },
};

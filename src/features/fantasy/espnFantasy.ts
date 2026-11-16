import type { FantasyLeague, FantasyPlayer } from "./types";

type Json = Record<string, unknown>;

/** Which ESPN fantasy team to show: the ids in its team page link. */
export type EspnTeamRef = { leagueId: string; teamId: string };

export type EspnFantasyQuery = EspnTeamRef & { season: number; week: number };

export interface EspnFantasySource {
  load(query: EspnFantasyQuery, signal: AbortSignal): Promise<FantasyLeague[]>;
}

const BASE_URL =
  "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons";

const obj = (value: unknown): Json =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const text = (value: unknown) =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

// ESPN fantasy's NFL team ids, as the scoreboard abbreviates those teams.
const proTeams: Readonly<Record<number, string>> = {
  1: "ATL",
  2: "BUF",
  3: "CHI",
  4: "CIN",
  5: "CLE",
  6: "DAL",
  7: "DEN",
  8: "DET",
  9: "GB",
  10: "TEN",
  11: "IND",
  12: "KC",
  13: "LV",
  14: "LAR",
  15: "MIA",
  16: "MIN",
  17: "NE",
  18: "NO",
  19: "NYG",
  20: "NYJ",
  21: "PHI",
  22: "ARI",
  23: "PIT",
  24: "LAC",
  25: "SF",
  26: "SEA",
  27: "TB",
  28: "WSH",
  29: "CAR",
  30: "JAX",
  33: "BAL",
  34: "HOU",
};

const positions: Readonly<Record<number, string>> = {
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  16: "D/ST",
};

// Lineup slots for players who aren't starting: the bench and injured reserve.
const BENCH_SLOTS = new Set([20, 21]);

// ESPN's stat lines: source 0 is actual (1 is projected); split 1 is one week.
const ACTUAL = 0;
const SINGLE_WEEK = 1;

/**
 * The league and team ids in an ESPN fantasy team link, e.g.
 * `https://fantasy.espn.com/football/team?leagueId=123&teamId=4`.
 */
export const parseEspnTeamLink = (link: string): EspnTeamRef | undefined => {
  try {
    const params = new URL(link.trim()).searchParams;
    const leagueId = params.get("leagueId") ?? "";
    const teamId = params.get("teamId") ?? "";

    return /^\d+$/.test(leagueId) && /^\d+$/.test(teamId)
      ? { leagueId, teamId }
      : undefined;
  } catch {
    return undefined;
  }
};

// A player's actual fantasy points in one week; 0 before they play.
const weekPoints = (player: Json, week: number) => {
  const line = list(player.stats)
    .map(obj)
    .find(
      (stat) =>
        stat.scoringPeriodId === week &&
        stat.statSourceId === ACTUAL &&
        stat.statSplitTypeId === SINGLE_WEEK,
    );

  return typeof line?.appliedTotal === "number" ? line.appliedTotal : 0;
};

/** One team's players and week points from ESPN's league roster view. */
export const parseEspnFantasyTeam = (
  payload: unknown,
  teamId: string,
  week: number,
): FantasyLeague | undefined => {
  const league = obj(payload);
  const team = list(league.teams)
    .map(obj)
    .find((row) => text(row.id) === teamId);
  if (!team) {
    return undefined;
  }
  const players = list(obj(team.roster).entries)
    .map(obj)
    .flatMap((entry): FantasyPlayer[] => {
      const player = obj(obj(entry.playerPoolEntry).player);
      const name = text(player.fullName);
      const team = proTeams[Number(player.proTeamId)];
      if (!name || !team) {
        return [];
      }

      return [
        {
          id: text(player.id),
          name,
          position: positions[Number(player.defaultPositionId)] ?? "",
          team,
          points: weekPoints(player, week),
          starter: !BENCH_SLOTS.has(Number(entry.lineupSlotId)),
        },
      ];
    })
    // Starters first, keeping ESPN's lineup order within each group.
    .sort((a, b) => Number(b.starter) - Number(a.starter));

  return {
    id: `espn-${text(league.id) || teamId}`,
    name: text(obj(league.settings).name),
    players,
  };
};

// Public leagues load for anyone. Private leagues also load when the browser
// sends the viewer's ESPN sign-in cookies, which many browsers block.
export const espnFantasySource: EspnFantasySource = {
  load: async ({ leagueId, teamId, season, week }, signal) => {
    const url = new URL(`${BASE_URL}/${season}/segments/0/leagues/${leagueId}`);
    for (const view of ["mSettings", "mTeam", "mRoster"]) {
      url.searchParams.append("view", view);
    }
    url.searchParams.set("scoringPeriodId", String(week));
    const response = await fetch(url, {
      signal,
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`ESPN fantasy returned HTTP ${response.status}.`);
    }
    const team = parseEspnFantasyTeam(await response.json(), teamId, week);

    return team ? [team] : [];
  },
};

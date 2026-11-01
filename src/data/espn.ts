import type {
  Division,
  LeagueRow,
  LeagueTable,
  LeagueSource,
  Game,
  GameState,
  ScoreboardSource,
  Team,
} from "./types";

type Json = Record<string, unknown>;
const obj = (value: unknown): Json =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const str = (value: unknown, fallback = "") =>
  typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;
const number = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;
const image = (value: unknown) => {
  const url = str(value);
  return /^https:\/\/(?:a|a[0-9])\.espncdn\.com\//.test(url) ? url : undefined;
};
const team = (raw: Json): Team => {
  const t = obj(raw.team);
  const rank = number(obj(raw.curatedRank).current);
  return {
    id: str(raw.id),
    name: str(t.shortDisplayName, str(t.displayName, "Unknown team")),
    abbreviation: str(t.abbreviation),
    logo: image(t.logo),
    color: /^[0-9a-f]{6}$/i.test(str(t.color)) ? `#${t.color}` : "#a6b99d",
    score: str(raw.score, "—"),
    rank: rank && rank <= 25 ? rank : undefined,
    record: str(
      obj(list(raw.records).find((r) => obj(r).type === "total")).summary,
    ),
    conferenceId: str(t.conferenceId),
    quarters: list(raw.linescores).map((q) =>
      str(obj(q).displayValue, str(obj(q).value, "—")),
    ),
  };
};
const gameSituation = (situation: Json, competitors: Json[]): string => {
  const downDistance =
    str(situation.downDistanceText) || str(situation.shortDownDistanceText);
  if (downDistance) return downDistance;

  const lastPlay = obj(situation.lastPlay);
  const playType = str(obj(lastPlay.type).text);
  if (!playType) return "";

  const scoringTeam = competitors.find(
    (competitor) => str(competitor.id) === str(obj(lastPlay.team).id),
  );
  const abbreviation = str(obj(scoringTeam?.team).abbreviation);
  return abbreviation ? `${abbreviation} - ${playType}` : playType;
};

export const parseScoreboard = (payload: unknown): Game[] => {
  const root = obj(payload);
  if (!Array.isArray(root.events)) throw new Error("Unexpected ESPN response.");
  const games: Game[] = [];
  for (const raw of root.events) {
    const e = obj(raw),
      c = obj(list(e.competitions)[0]);
    const teams = list(c.competitors).map(obj);
    const home = teams.find((t) => t.homeAway === "home");
    const away = teams.find((t) => t.homeAway === "away");
    if (!e.id || !home || !away) continue;
    const status = obj(e.status ?? c.status),
      type = obj(status.type),
      s = obj(c.situation);
    const getState = (): GameState => {
      if (type.completed === true || type.state === "post") {
        return "final";
      }
      if (type.state === "in") {
        return "live";
      }
      if (
        type.state === "pre" &&
        ["STATUS_SCHEDULED", "STATUS_PREGAME"].includes(str(type.name))
      ) {
        return "upcoming";
      }
      return "other";
    };
    const state: GameState = getState();
    games.push({
      id: str(e.id),
      home: team(home),
      away: team(away),
      state,
      status: str(type.detail, str(type.description, "Scheduled")),
      clock: str(status.displayClock),
      period: number(status.period) ?? 0,
      start: str(e.date),
      broadcast: list(c.broadcasts)
        .flatMap((b) => list(obj(b).names))
        .map((n) => str(n))
        .join(" / "),
      venue: str(obj(c.venue).fullName),
      possession: str(s.possession),
      situation: gameSituation(s, teams),
      lastPlay: str(obj(s.lastPlay).text),
      redZone: s.isRedZone === true,
      homeTimeouts: number(s.homeTimeouts),
      awayTimeouts: number(s.awayTimeouts),
    });
  }
  return games.sort((a, b) => {
    const priority = { live: 0, upcoming: 1, other: 2, final: 3 };
    return (
      priority[a.state] - priority[b.state] ||
      (Date.parse(a.start) || 0) - (Date.parse(b.start) || 0)
    );
  });
};
export const espnSource: ScoreboardSource = {
  load: async (query, signal) => {
    const url = new URL(
      "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard",
    );
    url.search = new URLSearchParams({
      groups: query.division === "fbs" ? "80" : "81",
      // Larger limits fall back to ESPN's default 25-game response.
      limit: "100",
      dates: query.date.replaceAll("-", ""),
    }).toString();
    const response = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`ESPN returned HTTP ${response.status}.`);
    return parseScoreboard(await response.json());
  },
};

// League context stays separate from the high-frequency scoreboard feed.
export const parseStandings = (payload: unknown): LeagueTable[] => {
  const root = obj(payload);
  if (!Array.isArray(root.children))
    throw new Error("Unexpected ESPN standings response.");
  const collect = (raw: unknown): LeagueTable[] => {
    const group = obj(raw),
      standings = obj(group.standings);
    const entries = list(standings.entries);
    const rows: LeagueRow[] = entries
      .map((rawEntry) => {
        const entry = obj(rawEntry),
          t = obj(entry.team),
          stats = list(entry.stats).map(obj);
        const record = (type: string) => {
          const stat = stats.find((s) => s.type === type);
          return str(stat?.summary, str(stat?.displayValue, "—"));
        };
        return {
          id: str(t.id),
          name: str(t.shortDisplayName, str(t.displayName, str(t.location))),
          record: record("total"),
          conferenceRecord: record("vsconf"),
        };
      })
      .filter((row) => row.id && row.name);
    const nested = list(group.children).flatMap(collect);
    if (!rows.length) return nested;
    return [
      {
        id: str(group.id),
        title: str(group.name, "Conference"),
        subtitle: str(standings.seasonDisplayName, str(standings.season)),
        rows,
      },
      ...nested,
    ];
  };
  return root.children.flatMap(collect);
};

export const parseRankings = (
  payload: unknown,
  division: Division,
): LeagueTable[] => {
  const root = obj(payload);
  if (!Array.isArray(root.rankings))
    throw new Error("Unexpected ESPN rankings response.");
  return root.rankings
    .map(obj)
    .filter((poll) => {
      const name = str(poll.name).toLowerCase();
      return division === "fcs"
        ? name.includes("fcs")
        : /ap top 25|coaches poll|playoff/.test(name) &&
            !/fcs|division ii|division iii/.test(name);
    })
    .map((poll) => ({
      id: str(poll.id, str(poll.name)),
      title: str(poll.name),
      subtitle: [
        str(obj(poll.season).displayName),
        str(obj(poll.occurrence).displayValue),
      ]
        .filter(Boolean)
        .join(" · "),
      rows: list(poll.ranks)
        .map((rawRank) => {
          const r = obj(rawRank),
            t = obj(r.team);
          return {
            id: str(t.id),
            name: str(
              t.shortDisplayName,
              str(t.nickname, str(t.location, str(t.displayName))),
            ),
            rank: number(r.current),
            record: str(r.recordSummary, "—"),
            points: str(r.points, "—"),
          };
        })
        .filter((row) => row.id && row.rank !== undefined && row.rank <= 25)
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
    }));
};

const loadLeagueJson = async (
  url: string,
  signal: AbortSignal,
): Promise<unknown> => {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`ESPN returned HTTP ${response.status}.`);
  return response.json();
};

export const espnLeagueSource: LeagueSource = {
  loadStandings: async (division, signal) => {
    const url = new URL(
      "https://site.web.api.espn.com/apis/v2/sports/football/college-football/standings",
    );
    url.search = new URLSearchParams({
      group: division === "fbs" ? "80" : "81",
      level: "2",
      type: "0",
    }).toString();
    return parseStandings(await loadLeagueJson(url.toString(), signal));
  },
  loadRankings: async (division, signal) =>
    parseRankings(
      await loadLeagueJson(
        "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings",
        signal,
      ),
      division,
    ),
};

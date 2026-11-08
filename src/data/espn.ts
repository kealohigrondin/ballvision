import type {
  Division,
  LeagueRow,
  LeagueTable,
  LeagueSource,
  Game,
  GameState,
  TeamSchedule,
  TeamScheduleSource,
  ScoreboardSource,
  SeasonCalendar,
  Team,
  Week,
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

const integer = (value: unknown): number | undefined => {
  const text = str(value).trim();
  return /^\d+$/.test(text) ? Number(text) : undefined;
};

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
    location: str(t.location),
    abbreviation: str(t.abbreviation),
    logo:
      image(t.logo) ??
      list(t.logos)
        .map((logo) => image(obj(logo).href))
        .find(Boolean),
    color: /^[0-9a-f]{6}$/i.test(str(t.color)) ? `#${t.color}` : "#a6b99d",
    score: str(
      obj(raw.score).displayValue,
      str(obj(raw.score).value, str(raw.score, "—")),
    ),
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
        .flatMap((b) => {
          const broadcast = obj(b);
          return broadcast.names ?? [obj(broadcast.media).shortName];
        })
        .map((n) => str(n))
        .filter(Boolean)
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

export const parseCalendar = (payload: unknown): SeasonCalendar => {
  const root = obj(payload);
  const league = obj(list(root.leagues)[0]);
  const season = obj(root.season ?? league.season);
  const year = integer(season.year);
  if (year === undefined) return { weeks: [] };
  const weeks = list(league.calendar)
    .map(obj)
    .flatMap((seasonType): Week[] => {
      const type = integer(seasonType.value);
      if (type === undefined) return [];
      return list(seasonType.entries)
        .map(obj)
        .flatMap((entry): Week[] => {
          const weekNumber = integer(entry.value);
          if (weekNumber === undefined) return [];
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
    `https://site.api.espn.com/apis/site/v2/sports/football/${division === "nfl" ? "nfl" : "college-football"}/scoreboard`,
  );
  url.search = new URLSearchParams({
    ...(division !== "nfl" && {
      groups: division === "fbs" ? "80" : "81",
    }),
    ...params,
  }).toString();
  return url;
};

const loadScoreboardJson = async (
  url: URL,
  signal: AbortSignal,
): Promise<unknown> => {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`ESPN returned HTTP ${response.status}.`);
  return response.json();
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
    return parseScoreboard(await loadScoreboardJson(url, signal));
  },
  // Every scoreboard response carries the season calendar, so the smallest
  // slate is enough to list the selectable weeks.
  loadCalendar: async (division, signal) =>
    parseCalendar(
      await loadScoreboardJson(scoreboardUrl(division, { limit: "1" }), signal),
    ),
};

// League context stays separate from the high-frequency scoreboard feed.
const leagueTeamIdentity = (team: Json) => ({
  logo:
    image(team.logo) ??
    list(team.logos)
      .map((logo) => image(obj(logo).href))
      .find(Boolean),
  abbreviation: str(team.abbreviation),
  color: /^[0-9a-f]{6}$/i.test(str(team.color)) ? `#${team.color}` : undefined,
});

const conferenceWinPercentage = (record?: string): number => {
  const match = record?.match(/^(\d+)-(\d+)(?:-(\d+))?$/);
  if (!match) return -1;
  const wins = Number(match[1]);
  const losses = Number(match[2]);
  const ties = Number(match[3] ?? 0);
  const games = wins + losses + ties;
  return games > 0 ? (wins + ties / 2) / games : 0;
};

export const parseStandings = (
  payload: unknown,
  division: Division = "fbs",
): LeagueTable[] => {
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
          ...leagueTeamIdentity(t),
          id: str(t.id),
          name: str(t.shortDisplayName, str(t.displayName, str(t.location))),
          record: record("total"),
          conferenceRecord: record("vsconf"),
        };
      })
      .filter((row) => row.id && row.name);
    if (division !== "nfl") {
      rows.sort(
        (a, b) =>
          conferenceWinPercentage(b.conferenceRecord) -
          conferenceWinPercentage(a.conferenceRecord),
      );
    }
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
            ...leagueTeamIdentity(t),
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
      `https://site.web.api.espn.com/apis/v2/sports/football/${division === "nfl" ? "nfl" : "college-football"}/standings`,
    );
    url.search = new URLSearchParams({
      ...(division !== "nfl" && { group: division === "fbs" ? "80" : "81" }),
      level: division === "nfl" ? "3" : "2",
      type: "0",
    }).toString();
    return parseStandings(
      await loadLeagueJson(url.toString(), signal),
      division,
    );
  },
  loadRankings: async (division, signal) => {
    if (division === "nfl") return [];
    return parseRankings(
      await loadLeagueJson(
        "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings",
        signal,
      ),
      division,
    );
  },
};

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
    const sport = division === "nfl" ? "nfl" : "college-football";
    const url = new URL(
      `https://site.api.espn.com/apis/site/v2/sports/football/${sport}/teams/${encodeURIComponent(teamId)}/schedule`,
    );
    url.searchParams.set("seasontype", "2");
    const regular = await loadLeagueJson(url.toString(), signal);
    const schedule = parseTeamSchedule(regular, teamId);
    const season = str(obj(obj(regular).season).year);
    if (!/^\d{4}$/.test(season)) return schedule;
    url.searchParams.set("season", season);
    url.searchParams.set("seasontype", "3");
    const postseason = parseTeamSchedule(
      await loadLeagueJson(url.toString(), signal),
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

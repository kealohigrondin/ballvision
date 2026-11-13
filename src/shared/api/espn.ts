import type { Division, Game, GameState, Team } from "@/shared/types";

export type Json = Record<string, unknown>;

export const obj = (value: unknown): Json =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};

export const list = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

export const str = (value: unknown, fallback = "") =>
  typeof value === "string" || typeof value === "number"
    ? String(value)
    : fallback;

export const number = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

export const integer = (value: unknown): number | undefined => {
  const text = str(value).trim();

  return /^\d+$/.test(text) ? Number(text) : undefined;
};

export const image = (value: unknown) => {
  const url = str(value);

  return /^https:\/\/(?:a|a[0-9])\.espncdn\.com\//.test(url) ? url : undefined;
};

// Team logos bundled at 64px, named {league}/{espnTeamId}-{light|dark}.png.
// src/assets/logos/teamLogos.json records the ESPN source of each file.
const localLogoFiles = import.meta.glob<string>("/src/assets/logos/*/*.png", {
  eager: true,
  query: "?no-inline",
  import: "default",
});

const localLogo = (league: string, id: string, variant: "light" | "dark") =>
  localLogoFiles[`/src/assets/logos/${league}/${id}-${variant}.png`];

// ESPN team ids repeat between the NFL and college, so the league comes from
// ESPN's logo URL. College ids are unique across FBS and FCS.
export const teamLogos = (
  id: string,
  espnLogo?: string,
  espnLogoDark?: string,
): { logo?: string; logoDark?: string } => {
  const leagues = espnLogo?.includes("/teamlogos/nfl/")
    ? ["nfl"]
    : espnLogo?.includes("/teamlogos/ncaa/")
      ? ["fbs", "fcs"]
      : [];
  const league = leagues.find((name) => localLogo(name, id, "light"));
  if (!league) {
    return { logo: espnLogo, logoDark: espnLogoDark };
  }

  return {
    logo: localLogo(league, id, "light"),
    logoDark: localLogo(league, id, "dark"),
  };
};

const team = (raw: Json): Team => {
  const t = obj(raw.team);
  const rank = number(obj(raw.curatedRank).current);

  return {
    id: str(raw.id),
    name: str(t.shortDisplayName, str(t.displayName, "Unknown team")),
    location: str(t.location),
    abbreviation: str(t.abbreviation),
    ...teamLogos(
      str(raw.id),
      image(t.logo) ??
        list(t.logos)
          .map((logo) => image(obj(logo).href))
          .find(Boolean),
      image(t.logoDark),
    ),
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
  if (downDistance) {
    return downDistance;
  }

  const lastPlay = obj(situation.lastPlay);
  const playType = str(obj(lastPlay.type).text);
  if (!playType) {
    return "";
  }

  const scoringTeam = competitors.find(
    (competitor) => str(competitor.id) === str(obj(lastPlay.team).id),
  );
  const abbreviation = str(obj(scoringTeam?.team).abbreviation);

  return abbreviation ? `${abbreviation} - ${playType}` : playType;
};

export const parseScoreboard = (payload: unknown): Game[] => {
  const root = obj(payload);
  if (!Array.isArray(root.events)) {
    throw new Error("Unexpected ESPN response.");
  }
  const games: Game[] = [];
  for (const raw of root.events) {
    const e = obj(raw),
      c = obj(list(e.competitions)[0]);
    const teams = list(c.competitors).map(obj);
    const home = teams.find((t) => t.homeAway === "home");
    const away = teams.find((t) => t.homeAway === "away");
    if (!e.id || !home || !away) {
      continue;
    }
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

/** ESPN's API path segment for a division. */
export const espnSport = (division: Division) =>
  division === "nfl" ? "nfl" : "college-football";

export const fetchEspnJson = async (
  url: string | URL,
  signal: AbortSignal,
): Promise<unknown> => {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`ESPN returned HTTP ${response.status}.`);
  }

  return response.json();
};

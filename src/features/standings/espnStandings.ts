import {
  fetchEspnJson,
  image,
  type Json,
  list,
  number,
  obj,
  str,
  teamLogos,
} from "@/shared/api/espn";
import type { Division } from "@/shared/types";

import type { LeagueRow, LeagueSource, LeagueTable } from "./types";

// League context stays separate from the high-frequency scoreboard feed.
const leagueTeamIdentity = (team: Json) => ({
  ...teamLogos(
    str(team.id),
    image(team.logo) ??
      list(team.logos)
        .map((logo) => image(obj(logo).href))
        .find(Boolean),
  ),
  abbreviation: str(team.abbreviation),
  color: /^[0-9a-f]{6}$/i.test(str(team.color)) ? `#${team.color}` : undefined,
});

const conferenceWinPercentage = (record?: string): number => {
  const match = record?.match(/^(\d+)-(\d+)(?:-(\d+))?$/);
  if (!match) {
    return -1;
  }
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
  if (!Array.isArray(root.children)) {
    throw new Error("Unexpected ESPN standings response.");
  }

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
    if (!rows.length) {
      return nested;
    }

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

// NFL standings come from two ESPN payloads: the conference level (AFC and
// NFC, each with a playoff seed per team) and the division level.
export const parseNflStandings = (
  conferencePayload: unknown,
  divisionPayload: unknown,
): LeagueTable[] => {
  const root = obj(conferencePayload);
  if (!Array.isArray(root.children)) {
    throw new Error("Unexpected ESPN standings response.");
  }
  const conferences = root.children.map((raw) => {
    const group = obj(raw),
      standings = obj(group.standings);
    const rows = list(standings.entries).map((rawEntry) => {
      const entry = obj(rawEntry),
        t = obj(entry.team),
        stats = list(entry.stats).map(obj);

      const stat = (name: string) => stats.find((s) => s.name === name);

      const record = (type: string) => {
        const found = stats.find((s) => s.type === type);

        return str(found?.summary, str(found?.displayValue, "—"));
      };

      return {
        row: {
          ...leagueTeamIdentity(t),
          id: str(t.id),
          name: str(t.shortDisplayName, str(t.displayName, str(t.location))),
          record: record("total"),
          conferenceRecord: record("vsconf"),
        },
        seed: number(stat("playoffSeed")?.value) ?? Infinity,
        winPercent: number(stat("winPercent")?.value) ?? 0,
      };
    });

    return {
      id: str(group.id),
      title: str(group.abbreviation, str(group.name, "Conference")),
      subtitle: str(standings.seasonDisplayName, str(standings.season)),
      rows: rows.filter(({ row }) => row.id && row.name),
    };
  });

  // Seeds 1-4 win their divisions and 5-7 are wild cards: a dashed line
  // separates the two, and a solid one marks the playoff cut.
  const dividerAfterSeed = (seed: number) => {
    if (seed === 4) {
      return "dashed" as const;
    }

    return seed === 7 ? ("solid" as const) : undefined;
  };
  const wildcard: LeagueTable[] = conferences.map((conference) => ({
    id: `${conference.id}-wildcard`,
    title: conference.title,
    subtitle: conference.subtitle,
    nflView: "wildcard",
    rows: [...conference.rows]
      .sort((a, b) => a.seed - b.seed)
      .map(({ row, seed }) => ({
        ...row,
        rank: Number.isFinite(seed) ? seed : undefined,
        dividerAfter: dividerAfterSeed(seed),
      })),
  }));
  // Seeds already include the NFL tiebreakers, so they settle equal records.
  const conference: LeagueTable[] = conferences.map((conference) => ({
    id: `${conference.id}-conference`,
    title: conference.title,
    subtitle: conference.subtitle,
    nflView: "conference",
    rows: [...conference.rows]
      .sort((a, b) => b.winPercent - a.winPercent || a.seed - b.seed)
      .map(({ row }) => row),
  }));
  const division: LeagueTable[] = parseStandings(divisionPayload, "nfl").map(
    (table) => ({ ...table, nflView: "division" }),
  );

  return [...wildcard, ...division, ...conference];
};

export const parseRankings = (
  payload: unknown,
  division: Division,
): LeagueTable[] => {
  const root = obj(payload);
  if (!Array.isArray(root.rankings)) {
    throw new Error("Unexpected ESPN rankings response.");
  }

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
      poll,
      // The playoff committee ranks teams without voting points.
      pointsBased: str(poll.type) !== "cfp",
    }))
    .map(({ poll, pointsBased }) => ({
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
          const rank = number(r.current);
          // ESPN sends previous: 0 for teams that were unranked last poll.
          // Its trend text treats them as having been 26th, so work the
          // change out from the previous rank instead.
          const previous = number(r.previous);
          const ranked = rank !== undefined && previous !== undefined;

          return {
            ...leagueTeamIdentity(t),
            id: str(t.id),
            name: str(
              t.shortDisplayName,
              str(t.nickname, str(t.location, str(t.displayName))),
            ),
            rank,
            record: str(r.recordSummary, "—"),
            points: pointsBased ? str(r.points, "—") : undefined,
            rankChange: ranked && previous > 0 ? previous - rank : undefined,
            newlyRanked: ranked && previous === 0 ? true : undefined,
          };
        })
        .filter((row) => row.id && row.rank !== undefined && row.rank <= 25)
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)),
    }));
};

export const espnLeagueSource: LeagueSource = {
  loadStandings: async (division, signal) => {
    if (division === "nfl") {
      const nflUrl = (level: string) =>
        `https://site.web.api.espn.com/apis/v2/sports/football/nfl/standings?level=${level}&type=0`;
      const [conferences, divisions] = await Promise.all([
        fetchEspnJson(nflUrl("2"), signal),
        fetchEspnJson(nflUrl("3"), signal),
      ]);

      return parseNflStandings(conferences, divisions);
    }
    const url = new URL(
      "https://site.web.api.espn.com/apis/v2/sports/football/college-football/standings",
    );
    url.search = new URLSearchParams({
      group: division === "fbs" ? "80" : "81",
      level: "2",
      type: "0",
    }).toString();

    return parseStandings(
      await fetchEspnJson(url.toString(), signal),
      division,
    );
  },
  loadRankings: async (division, signal) => {
    if (division === "nfl") {
      return [];
    }

    return parseRankings(
      await fetchEspnJson(
        "https://site.api.espn.com/apis/site/v2/sports/football/college-football/rankings",
        signal,
      ),
      division,
    );
  },
};

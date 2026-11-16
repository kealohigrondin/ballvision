import { fileURLToPath } from "node:url";

import type { Page, Route } from "@playwright/test";

import eplScoreboard from "../fixtures/epl-scoreboard.json" with { type: "json" };
import eplStandings from "../fixtures/epl-standings.json" with { type: "json" };
import nflConferences from "../fixtures/nfl-standings-conferences.json" with { type: "json" };
import nflDivisions from "../fixtures/nfl-standings-divisions.json" with { type: "json" };
import rankings from "../fixtures/rankings.json" with { type: "json" };
import scoreboard from "../fixtures/scoreboard.json" with { type: "json" };
import summaries from "../fixtures/summaries.json" with { type: "json" };
import uclScoreboard from "../fixtures/ucl-scoreboard.json" with { type: "json" };
import uclStandings from "../fixtures/ucl-standings.json" with { type: "json" };

const headshot = fileURLToPath(
  new URL("../fixtures/headshot.png", import.meta.url),
);

const json = (route: Route, body: unknown) =>
  route.fulfill({ status: 200, contentType: "application/json", json: body });

// The app talks to ESPN and Polymarket directly from the browser. Serve
// fixtures instead so tests and screenshots are deterministic and offline.
export const mockApis = async (page: Page): Promise<void> => {
  await page.route(/^https:\/\/(?!127\.0\.0\.1|localhost)/, (route) =>
    route.abort(),
  );
  await page.route("https://site.api.espn.com/**/scoreboard*", (route) =>
    json(route, scoreboard),
  );
  // Game summaries (leaders and team stats) by event id; others are empty.
  await page.route("https://site.api.espn.com/**/summary*", (route) => {
    const event = new URL(route.request().url()).searchParams.get("event");

    return json(
      route,
      summaries[(event ?? "") as keyof typeof summaries] ?? {},
    );
  });
  await page.route("https://site.web.api.espn.com/**/standings*", (route) =>
    json(route, { children: [] }),
  );
  await page.route("https://site.api.espn.com/**/rankings*", (route) =>
    json(route, { rankings: [] }),
  );
  await page.route("https://site.api.espn.com/**/schedule*", (route) =>
    json(route, { events: [] }),
  );
  await page.route(/^https:\/\/(gamma-api|clob)\.polymarket\.com\//, (route) =>
    json(route, []),
  );
  // Player headshots, resized by ESPN's image service.
  await page.route(/^https:\/\/a\.espncdn\.com\/combiner\/i\?/, (route) =>
    route.fulfill({ path: headshot, contentType: "image/png" }),
  );
};

// Serve Premier League and Champions League scoreboards and tables captured
// from ESPN. The Premier League's Nov 17-23 matchweek has finals (one a 1-1
// draw), a match live in its 67th minute and upcoming fixtures. Call after
// mockApis.
export const mockSoccer = async (page: Page): Promise<void> => {
  const leagues = [
    ["eng.1", eplScoreboard, eplStandings],
    ["uefa.champions", uclScoreboard, uclStandings],
  ] as const;
  for (const [slug, board, table] of leagues) {
    await page.route(
      `https://site.api.espn.com/**/soccer/${slug}/scoreboard*`,
      (route) => json(route, board),
    );
    await page.route(
      `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings*`,
      (route) => json(route, table),
    );
  }
};

// Serve real NFL standings captured from ESPN: level 2 is the AFC and NFC,
// level 3 their divisions. Call after mockApis so these routes take priority.
export const mockNflStandings = async (page: Page): Promise<void> => {
  await page.route("https://site.web.api.espn.com/**/nfl/standings*", (route) =>
    json(
      route,
      new URL(route.request().url()).searchParams.get("level") === "2"
        ? nflConferences
        : nflDivisions,
    ),
  );
};

// Serve real college rankings captured from ESPN (Playoff Committee, AP
// Top 25 and Coaches Poll). Call after mockApis so this route takes priority.
export const mockRankings = async (page: Page): Promise<void> => {
  await page.route("https://site.api.espn.com/**/rankings*", (route) =>
    json(route, rankings),
  );
};

const collegeConference = (id: string, name: string, team: string) => ({
  id,
  name,
  standings: {
    season: 2026,
    entries: [
      {
        team: { id: `${id}-1`, shortDisplayName: team, logos: [] },
        stats: [
          { type: "total", summary: "7-1" },
          { type: "vsconf", summary: "5-1" },
        ],
      },
    ],
  },
});

// Serve two college conferences so the conference picker has a choice.
// Call after mockApis so this route takes priority.
export const mockCollegeStandings = async (page: Page): Promise<void> => {
  await page.route(
    "https://site.web.api.espn.com/**/college-football/standings*",
    (route) =>
      json(route, {
        children: [
          collegeConference("sec", "SEC", "Ridge Hawks"),
          collegeConference("acc", "ACC", "Summit Goats"),
        ],
      }),
  );
};

const secTeams = [
  { id: "61", name: "Georgia", abbreviation: "UGA", total: "8-1", conf: "6-1" },
  { id: "251", name: "Texas", abbreviation: "TEX", total: "8-1", conf: "5-1" },
  { id: "99", name: "LSU", abbreviation: "LSU", total: "7-2", conf: "4-2" },
  {
    id: "333",
    name: "Alabama",
    abbreviation: "ALA",
    total: "6-3",
    conf: "4-3",
  },
  {
    id: "145",
    name: "Ole Miss",
    abbreviation: "MISS",
    total: "6-3",
    conf: "3-3",
  },
  {
    id: "2633",
    name: "Tennessee",
    abbreviation: "TENN",
    total: "5-4",
    conf: "2-4",
  },
  { id: "57", name: "Florida", abbreviation: "FLA", total: "4-5", conf: "2-5" },
  {
    id: "2579",
    name: "South Carolina",
    abbreviation: "SC",
    total: "3-6",
    conf: "1-6",
  },
];

// Serve an SEC table of real teams with bundled logos for screenshots.
// Call after mockApis so this route takes priority.
export const mockSecStandings = async (page: Page): Promise<void> => {
  await page.route(
    "https://site.web.api.espn.com/**/college-football/standings*",
    (route) =>
      json(route, {
        children: [
          {
            id: "8",
            name: "SEC",
            standings: {
              season: 2026,
              entries: secTeams.map((team) => ({
                team: {
                  id: team.id,
                  shortDisplayName: team.name,
                  abbreviation: team.abbreviation,
                  logos: [
                    {
                      href: `https://a.espncdn.com/i/teamlogos/ncaa/500/${team.id}.png`,
                    },
                  ],
                },
                stats: [
                  { type: "total", summary: team.total },
                  { type: "vsconf", summary: team.conf },
                ],
              })),
            },
          },
        ],
      }),
  );
};

type ScheduleOpponent = {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
};

const nflOpponents: ScheduleOpponent[] = [
  { id: "2", name: "Bills", abbreviation: "BUF", logo: "nfl/500/buf" },
  { id: "12", name: "Chiefs", abbreviation: "KC", logo: "nfl/500/kc" },
  { id: "25", name: "49ers", abbreviation: "SF", logo: "nfl/500/sf" },
  { id: "14", name: "Rams", abbreviation: "LAR", logo: "nfl/500/lar" },
  { id: "22", name: "Cardinals", abbreviation: "ARI", logo: "nfl/500/ari" },
];

const collegeOpponents: ScheduleOpponent[] = [
  { id: "228", name: "Clemson", abbreviation: "CLEM", logo: "ncaa/500/228" },
  { id: "333", name: "Alabama", abbreviation: "ALA", logo: "ncaa/500/333" },
  { id: "251", name: "Texas", abbreviation: "TEX", logo: "ncaa/500/251" },
  { id: "194", name: "Ohio State", abbreviation: "OSU", logo: "ncaa/500/194" },
  { id: "130", name: "Michigan", abbreviation: "MICH", logo: "ncaa/500/130" },
];

type ScheduleGameFixture = {
  date: string;
  state: "pre" | "in" | "post";
  name: string;
  detail: string;
  scores: string[];
  period?: number;
  clock?: string;
  timeValid?: boolean;
};

// One game per state the schedule shows: two finals (a win and a loss), a
// live game, a confirmed kickoff and a kickoff time still to be announced.
const scheduleGames: ScheduleGameFixture[] = [
  {
    date: "2026-10-17T20:00Z",
    state: "post",
    name: "STATUS_FINAL",
    detail: "Final",
    scores: ["31", "17"],
  },
  {
    date: "2026-10-24T20:00Z",
    state: "post",
    name: "STATUS_FINAL",
    detail: "Final",
    scores: ["10", "24"],
  },
  {
    date: "2026-11-07T20:30Z",
    state: "in",
    name: "STATUS_IN_PROGRESS",
    detail: "4:12 - 3rd Quarter",
    scores: ["21", "14"],
    period: 3,
    clock: "4:12",
  },
  {
    date: "2026-11-14T21:25Z",
    state: "pre",
    name: "STATUS_SCHEDULED",
    detail: "Scheduled",
    scores: [],
  },
  {
    date: "2026-11-21T05:00Z",
    state: "pre",
    name: "STATUS_SCHEDULED",
    detail: "TBD",
    scores: [],
    timeValid: false,
  },
];

const scheduleEvent = (
  teamId: string,
  opponent: ScheduleOpponent,
  game: (typeof scheduleGames)[number],
  index: number,
) => {
  const home = index % 2 === 0;
  const [teamScore, opponentScore] = game.scores;

  return {
    id: `schedule-${teamId}-${index}`,
    date: game.date,
    timeValid: game.timeValid ?? true,
    status: {
      period: game.period,
      displayClock: game.clock,
      type: { state: game.state, name: game.name, detail: game.detail },
    },
    competitions: [
      {
        competitors: [
          {
            id: teamId,
            homeAway: home ? "home" : "away",
            score: teamScore,
            team: { shortDisplayName: "Team", abbreviation: "TM" },
          },
          {
            id: opponent.id,
            homeAway: home ? "away" : "home",
            score: opponentScore,
            team: {
              shortDisplayName: opponent.name,
              abbreviation: opponent.abbreviation,
              logo: `https://a.espncdn.com/i/teamlogos/${opponent.logo}.png`,
            },
          },
        ],
      },
    ],
  };
};

// Serve a five-game schedule for whichever team is requested, against real
// teams with bundled logos. Postseason requests come back empty. Call after
// mockApis so this route takes priority.
export const mockTeamSchedule = async (page: Page): Promise<void> => {
  await page.route("https://site.api.espn.com/**/schedule*", (route) => {
    const url = new URL(route.request().url());
    const teamId = url.pathname.split("/").at(-2) ?? "";
    const opponents = url.pathname.includes("/nfl/")
      ? nflOpponents
      : collegeOpponents;
    const events =
      url.searchParams.get("seasontype") === "3"
        ? []
        : scheduleGames.map((game, index) =>
            scheduleEvent(teamId, opponents[index], game, index),
          );

    return json(route, { season: { year: 2026, displayName: "2026" }, events });
  });
};

const sleeperPlayer = (name: string, position: string, team: string) => ({
  full_name: name,
  position,
  team,
});

// Serve one Sleeper league whose team has players in the fixture's live
// game (RDG at RIV). Call after mockApis so these routes take priority.
export const mockSleeper = async (page: Page): Promise<void> => {
  const responses: Record<string, unknown> = {
    "/v1/user/AaronY": { user_id: "me" },
    "/v1/user/me/leagues/nfl/2026": [
      { league_id: "L1", name: "Fanal Fantasy 3.0", status: "in_season" },
    ],
    "/v1/league/L1/rosters": [{ roster_id: 3, owner_id: "me" }],
    "/v1/league/L1/matchups/11": [
      {
        roster_id: 3,
        starters: ["101", "102"],
        players: ["101", "102", "103", "104"],
        players_points: { "101": 18.42, "102": 7.1, "103": 2.5, "104": 0 },
      },
    ],
    "/v1/players/nfl": {
      "101": sleeperPlayer("Riley Hawk", "QB", "RDG"),
      "102": sleeperPlayer("Otto Rivers", "WR", "RIV"),
      "103": sleeperPlayer("Benny Benchwell", "RB", "RDG"),
      "104": sleeperPlayer("Lake Ender", "TE", "LAK"),
    },
  };
  await page.route("https://api.sleeper.app/**", (route) =>
    json(route, responses[new URL(route.request().url()).pathname] ?? null),
  );
};

// Start the app on the NFL scoreboard with a saved Sleeper username.
export const saveSleeperUsername = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "ballvision:app-data:v1",
      JSON.stringify({
        version: 1,
        division: "nfl",
        sleeperUsername: "AaronY",
      }),
    );
  });
};

const espnFantasyEntry = (
  id: number,
  fullName: string,
  proTeamId: number,
  defaultPositionId: number,
  lineupSlotId: number,
  points: number,
) => ({
  lineupSlotId,
  playerPoolEntry: {
    player: {
      id,
      fullName,
      proTeamId,
      defaultPositionId,
      stats: [
        {
          scoringPeriodId: 11,
          statSourceId: 0,
          statSplitTypeId: 1,
          appliedTotal: points,
        },
      ],
    },
  },
});

export const ESPN_FANTASY_TEAM_LINK =
  "https://fantasy.espn.com/football/team?leagueId=4242&teamId=7&seasonId=2026";

// Serve one ESPN fantasy league whose team has players in the live game.
// ESPN fantasy knows only real NFL teams, so the live game's teams become
// Seattle (away) and San Francisco (home). Call after mockApis.
export const mockEspnFantasy = async (page: Page): Promise<void> => {
  const renamed = structuredClone(scoreboard);
  const live = renamed.events.find((event) => event.id === "1001");
  for (const team of live?.competitions[0].competitors ?? []) {
    team.team.abbreviation = team.homeAway === "home" ? "SF" : "SEA";
  }
  await page.route("https://site.api.espn.com/**/scoreboard*", (route) =>
    json(route, renamed),
  );
  await page.route(
    "https://lm-api-reads.fantasy.espn.com/**/leagues/4242*",
    (route) =>
      json(route, {
        id: 4242,
        settings: { name: "Sunday Scaries" },
        teams: [
          {
            id: 7,
            roster: {
              entries: [
                espnFantasyEntry(201, "Sam Seaver", 26, 1, 0, 22.36),
                espnFantasyEntry(202, "Niner Nate", 25, 3, 4, 9.8),
                espnFantasyEntry(203, "Pine Rider", 26, 2, 20, 3.1),
              ],
            },
          },
        ],
      }),
  );
};

// Start the app on the NFL scoreboard with a saved ESPN fantasy team.
export const saveEspnFantasyTeam = async (page: Page): Promise<void> => {
  await page.addInitScript((link) => {
    localStorage.setItem(
      "ballvision:app-data:v1",
      JSON.stringify({ version: 1, division: "nfl", espnFantasyTeam: link }),
    );
  }, ESPN_FANTASY_TEAM_LINK);
};

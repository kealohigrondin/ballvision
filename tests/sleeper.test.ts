import { afterEach, expect, it, vi } from "vitest";

import {
  directoryIsCurrent,
  findRosterId,
  parseActiveLeagues,
  parseFantasyPlayers,
  parseMatchupPlayerIds,
  parsePlayerDirectory,
  parseUserId,
  PLAYER_DIRECTORY_KEY,
  readStoredDirectory,
  sleeperSource,
  toEspnTeam,
} from "../src/data/sleeper";

const DAY = 24 * 60 * 60 * 1000;

const matchups = [
  {
    roster_id: 2,
    starters: ["9228", "0", "KC"],
    players: ["9228", "4983", "KC"],
    players_points: { "9228": 12.76, "4983": 3.1, KC: 7 },
  },
  { roster_id: 5, starters: ["1"], players: ["1"], players_points: {} },
];

const directory = {
  "9228": { name: "Bryce Young", position: "QB", team: "CAR" },
  "4983": { name: "DJ Moore", position: "WR", team: "BUF" },
  KC: { name: "Kansas City Chiefs", position: "DEF", team: "KC" },
};

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.removeItem(PLAYER_DIRECTORY_KEY);
});

it("reads the user id from a Sleeper user", () => {
  expect(parseUserId({ user_id: "608837330651906048" })).toBe(
    "608837330651906048",
  );
});

it("finds no user id when Sleeper has no such user", () => {
  expect(parseUserId(null)).toBe("");
});

it("keeps only leagues that are in season or in the playoffs", () => {
  expect(
    parseActiveLeagues([
      { league_id: "1", name: "Drafting", status: "pre_draft" },
      { league_id: "2", name: "Playing", status: "in_season" },
      { league_id: "3", name: "Playoffs", status: "post_season" },
      { league_id: "4", name: "Done", status: "complete" },
    ]),
  ).toEqual([
    { id: "2", name: "Playing" },
    { id: "3", name: "Playoffs" },
  ]);
});

it("finds the roster a user owns", () => {
  expect(
    findRosterId(
      [
        { roster_id: 1, owner_id: "other" },
        { roster_id: 2, owner_id: "me" },
      ],
      "me",
    ),
  ).toBe("2");
});

it("finds a roster the user co-owns", () => {
  expect(
    findRosterId(
      [{ roster_id: 4, owner_id: "other", co_owners: ["me"] }],
      "me",
    ),
  ).toBe("4");
});

it("lists a team's starters before its bench, skipping empty slots", () => {
  expect(parseMatchupPlayerIds(matchups, "2")).toEqual(["9228", "KC", "4983"]);
});

it("gives each player their points and whether they start", () => {
  expect(parseFantasyPlayers(matchups, "2", directory)).toEqual([
    { id: "9228", ...directory["9228"], points: 12.76, starter: true },
    { id: "KC", ...directory.KC, points: 7, starter: true },
    { id: "4983", ...directory["4983"], points: 3.1, starter: false },
  ]);
});

it("leaves out players missing from the player list", () => {
  expect(parseFantasyPlayers(matchups, "5", directory)).toEqual([]);
});

it("names team defenses by city and nickname", () => {
  expect(
    parsePlayerDirectory(
      {
        KC: {
          full_name: null,
          first_name: "Kansas City",
          last_name: "Chiefs",
          position: "DEF",
          team: "KC",
        },
      },
      ["KC"],
    ),
  ).toEqual({ KC: directory.KC });
});

it("keeps only the requested players from the player list", () => {
  const players = parsePlayerDirectory(
    {
      "9228": { full_name: "Bryce Young", position: "QB", team: "CAR" },
      "4983": { full_name: "DJ Moore", position: "WR", team: "BUF" },
    },
    ["9228"],
  );
  expect(Object.keys(players)).toEqual(["9228"]);
});

it("uses ESPN's abbreviation for Washington", () => {
  expect(toEspnTeam("WAS")).toBe("WSH");
});

it("treats stored players as current when fresh and complete", () => {
  expect(
    directoryIsCurrent({ savedAt: 0, players: directory }, ["KC"], DAY - 1),
  ).toBe(true);
});

it("treats stored players as stale after a day", () => {
  expect(
    directoryIsCurrent({ savedAt: 0, players: directory }, ["KC"], DAY),
  ).toBe(false);
});

it("treats stored players as stale when a roster has a new player", () => {
  expect(
    directoryIsCurrent({ savedAt: 0, players: directory }, ["123"], 1),
  ).toBe(false);
});

// Serves Sleeper responses by path and records each requested path.
const stubSleeper = () => {
  const requested: string[] = [];
  const responses: Record<string, unknown> = {
    "/v1/user/AaronY": { user_id: "me" },
    "/v1/user/me/leagues/nfl/2026": [
      { league_id: "L1", name: "Fanal Fantasy", status: "in_season" },
    ],
    "/v1/league/L1/rosters": [{ roster_id: 2, owner_id: "me" }],
    "/v1/league/L1/matchups/9": matchups,
    "/v1/players/nfl": {
      "9228": { full_name: "Bryce Young", position: "QB", team: "CAR" },
      "4983": { full_name: "DJ Moore", position: "WR", team: "BUF" },
      KC: {
        first_name: "Kansas City",
        last_name: "Chiefs",
        position: "DEF",
        team: "KC",
      },
      "1": { full_name: "Not Mine", position: "RB", team: "NE" },
    },
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      requested.push(path);

      return new Response(JSON.stringify(responses[path] ?? null));
    }),
  );

  return requested;
};

const query = { username: "AaronY", season: 2026, week: 9 };

it("loads the user's fantasy players for the week from Sleeper", async () => {
  stubSleeper();
  const leagues = await sleeperSource.load(query, new AbortController().signal);
  expect(leagues).toEqual([
    {
      id: "L1",
      name: "Fanal Fantasy",
      players: parseFantasyPlayers(matchups, "2", directory),
    },
  ]);
});

it("stores only the players on the user's rosters", async () => {
  stubSleeper();
  await sleeperSource.load(query, new AbortController().signal);
  expect(
    Object.keys(readStoredDirectory(localStorage)?.players ?? {}).sort(),
  ).toEqual(["4983", "9228", "KC"]);
});

it("skips the player list download when the stored players are current", async () => {
  localStorage.setItem(
    PLAYER_DIRECTORY_KEY,
    JSON.stringify({ savedAt: Date.now(), players: directory }),
  );
  const requested = stubSleeper();
  await sleeperSource.load(query, new AbortController().signal);
  expect(requested).not.toContain("/v1/players/nfl");
});

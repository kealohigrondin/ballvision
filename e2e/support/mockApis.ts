import type { Page, Route } from "@playwright/test";

import nflConferences from "../fixtures/nfl-standings-conferences.json" with { type: "json" };
import nflDivisions from "../fixtures/nfl-standings-divisions.json" with { type: "json" };
import rankings from "../fixtures/rankings.json" with { type: "json" };
import scoreboard from "../fixtures/scoreboard.json" with { type: "json" };

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

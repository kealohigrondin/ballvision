import type { Page, Route } from "@playwright/test";

import nflConferences from "../fixtures/nfl-standings-conferences.json" with { type: "json" };
import nflDivisions from "../fixtures/nfl-standings-divisions.json" with { type: "json" };
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

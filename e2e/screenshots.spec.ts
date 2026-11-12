import { expect, type Page, test } from "@playwright/test";

import { copy } from "../src/copy";
import scoreboard from "./fixtures/scoreboard.json" with { type: "json" };
import { mockApis, mockNflStandings, mockRankings } from "./support/mockApis";

// Captures reference screenshots for pull requests. Run with
// `npm run screenshots`; images are written to ./screenshots.
// Each image is exactly one screen of its viewport, at 1x scale, so its pixel
// size matches the device being tested.
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};

const themes = ["dark", "light"] as const;

test.use({ deviceScaleFactor: 1 });

const openDashboard = async (page: Page) => {
  // A fixed clock keeps the "Updated" timestamp stable between runs.
  await page.clock.setFixedTime(new Date("2026-11-07T21:00:00Z"));
  await mockApis(page);
  await page.goto("./");
  await expect(page.getByText("Ridge Hawks").first()).toBeVisible();
};

// Phones keep the theme toggle in the masthead menu.
const switchToLight = async (page: Page) => {
  const menu = page.locator("#masthead-menu-button");
  if (await menu.isVisible()) {
    await menu.click();
    await page.getByRole("button", { name: copy.theme.toLight }).click();
    await page.keyboard.press("Escape");
    await expect(page.locator("#masthead-menu-drawer")).toBeHidden();
  } else {
    await page.getByRole("button", { name: copy.theme.toLight }).click();
  }
};

test.describe("@screenshots", () => {
  for (const [device, viewport] of Object.entries(viewports)) {
    for (const theme of themes) {
      test(`${device} ${theme}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await openDashboard(page);
        if (theme === "light") {
          await switchToLight(page);
        }
        await page.screenshot({ path: `screenshots/${device}-${theme}.png` });
      });
    }
  }
});

// Real ESPN teams with bundled logos, swapped into the fixture's games.
// The app picks a logo's league from its ESPN URL, so NFL logos show on the
// college scoreboard too.
const logoTeams = [
  { id: "26", name: "Seahawks", logo: "nfl/500/sea" },
  { id: "2", name: "Bills", logo: "nfl/500/buf" },
  { id: "12", name: "Chiefs", logo: "nfl/500/kc" },
  { id: "61", name: "Georgia", logo: "ncaa/500/61" },
  { id: "333", name: "Alabama", logo: "ncaa/500/333" },
  { id: "292", name: "UT Rio Grande Valley", logo: "ncaa/500/292" },
];

const logoScoreboard = () => {
  const teams = [...logoTeams];
  const events = scoreboard.events.map((event) => ({
    ...event,
    competitions: event.competitions.map((competition) => ({
      ...competition,
      competitors: competition.competitors.map((competitor) => {
        const team = teams.shift();

        return team
          ? {
              ...competitor,
              id: team.id,
              team: {
                ...competitor.team,
                shortDisplayName: team.name,
                logo: `https://a.espncdn.com/i/teamlogos/${team.logo}.png`,
              },
            }
          : competitor;
      }),
    })),
  }));

  return { ...scoreboard, events };
};

const openLogoDashboard = async (page: Page) => {
  await page.clock.setFixedTime(new Date("2026-11-07T21:00:00Z"));
  await mockApis(page);
  await page.route("https://site.api.espn.com/**/scoreboard*", (route) =>
    route.fulfill({ json: logoScoreboard() }),
  );
  await page.goto("./");
  await expect(page.getByText("Georgia").first()).toBeVisible();
};

const waitForLogos = async (page: Page) => {
  const images = page.locator(".team-logo img");
  await expect(images).toHaveCount(logoTeams.length);
  await expect
    .poll(() =>
      images.evaluateAll((all) =>
        all.every(
          (image) =>
            image instanceof HTMLImageElement &&
            image.complete &&
            image.naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
};

test.describe("@screenshots team logo", () => {
  test.use({ viewport: viewports.desktop });

  for (const theme of themes) {
    test(`bundled logos, ${theme}`, async ({ page }) => {
      await openLogoDashboard(page);
      if (theme === "light") {
        await page.getByRole("button", { name: copy.theme.toLight }).click();
      }
      await waitForLogos(page);
      await page
        .getByRole("region", { name: copy.grid.label })
        .screenshot({ path: `screenshots/team-logo-${theme}.png` });
    });
  }

  test("fallback abbreviation", async ({ page }) => {
    await openDashboard(page);
    await page
      .locator(".team-logo")
      .first()
      .screenshot({ path: "screenshots/team-logo-fallback.png" });
  });
});

const openNflStandings = async (page: Page) => {
  await openDashboard(page);
  await mockNflStandings(page);
  await page
    .getByRole("button", { name: copy.scoresHeader.divisions.nfl })
    .click();
  await page.getByRole("button", { name: copy.navRail.standings }).click();
};

const screenshotLeaguePanel = async (page: Page, name: string) => {
  const panel = page.getByRole("complementary", { name: copy.league.panel });
  await expect(panel.getByRole("table").first()).toBeVisible();
  await expect
    .poll(() =>
      panel
        .locator(".team-logo img")
        .evaluateAll((all) =>
          all.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await panel.screenshot({ path: `screenshots/${name}.png` });
};

test.describe("@screenshots NFL league panel", () => {
  // Tall enough for every view, including all eight divisions, to fit
  // without scrolling the panel.
  test.use({ viewport: { width: 1440, height: 2500 } });

  for (const view of ["wildcard", "division", "conference"] as const) {
    test(`${view}, dark`, async ({ page }) => {
      await openNflStandings(page);
      await page.getByLabel(copy.league.standingsView).selectOption(view);
      await screenshotLeaguePanel(page, `league-panel-nfl-${view}-dark`);
    });
  }

  test("wildcard, light", async ({ page }) => {
    await openNflStandings(page);
    await page.getByRole("button", { name: copy.theme.toLight }).click();
    await screenshotLeaguePanel(page, "league-panel-nfl-wildcard-light");
  });
});

const openRankings = async (page: Page, poll: string) => {
  await openDashboard(page);
  await mockRankings(page);
  await page.getByRole("button", { name: copy.navRail.rankings }).click();
  await page.getByLabel(copy.league.poll).selectOption({ label: poll });
};

test.describe("@screenshots rankings panel", () => {
  // Tall enough for all 25 teams without scrolling the panel.
  test.use({ viewport: { width: 1440, height: 1500 } });

  for (const theme of themes) {
    test(`AP Top 25, ${theme}`, async ({ page }) => {
      await openRankings(page, "AP Top 25");
      if (theme === "light") {
        await page.getByRole("button", { name: copy.theme.toLight }).click();
      }
      await screenshotLeaguePanel(page, `league-panel-rankings-ap-${theme}`);
    });
  }

  test("Playoff Committee, dark", async ({ page }) => {
    await openRankings(page, "Playoff Committee Rankings");
    await screenshotLeaguePanel(page, "league-panel-rankings-committee-dark");
  });
});

test.describe("@screenshots phone header", () => {
  test.use({ viewport: viewports.mobile });

  test("masthead", async ({ page }) => {
    await openDashboard(page);
    await page
      .getByRole("banner")
      .screenshot({ path: "screenshots/masthead-mobile-dark.png" });
  });

  test("masthead menu, open", async ({ page }) => {
    await openDashboard(page);
    await page.locator("#masthead-menu-button").click();
    const drawer = page.locator("#masthead-menu-drawer");
    await expect(drawer).toBeVisible();
    // Let the slide-in finish so the sheet is fully on screen.
    await expect
      .poll(() =>
        drawer.evaluate(
          (el) => el.getBoundingClientRect().right <= window.innerWidth,
        ),
      )
      .toBe(true);
    await page.screenshot({ path: "screenshots/masthead-menu-open-dark.png" });
  });

  test("scores header", async ({ page }) => {
    await openDashboard(page);
    await page
      .locator("#scores-header")
      .screenshot({ path: "screenshots/scores-header-mobile-dark.png" });
  });
});

test.describe("@screenshots Windows 98 components", () => {
  test.use({ viewport: viewports.desktop });

  for (const theme of themes) {
    test(`game cards, ${theme}`, async ({ page }) => {
      await openDashboard(page);
      if (theme === "light") {
        await switchToLight(page);
      }
      const cards = page.locator("article");
      const states = ["live", "upcoming", "final"];
      for (const [index, state] of states.entries()) {
        await cards
          .nth(index)
          .screenshot({ path: `screenshots/game-card-${state}-${theme}.png` });
      }
    });

    test(`masthead, ${theme}`, async ({ page }) => {
      await openDashboard(page);
      if (theme === "light") {
        await switchToLight(page);
      }
      await page
        .getByRole("banner")
        .screenshot({ path: `screenshots/masthead-desktop-${theme}.png` });
    });

    test(`nav rail with an open panel, ${theme}`, async ({ page }) => {
      await openDashboard(page);
      if (theme === "light") {
        await switchToLight(page);
      }
      await page.getByRole("button", { name: copy.navRail.standings }).click();
      await page
        .getByRole("navigation", { name: copy.navRail.label })
        .screenshot({ path: `screenshots/nav-rail-active-${theme}.png` });
    });
  }
});

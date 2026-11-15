import { expect, type Page, test } from "@playwright/test";

import { copy } from "../src/copy";
import eplScoreboard from "./fixtures/epl-scoreboard.json" with { type: "json" };
import scoreboard from "./fixtures/scoreboard.json" with { type: "json" };
import summaries from "./fixtures/summaries.json" with { type: "json" };
import { stubDesktopNotifications } from "./support/desktopNotifications";
import {
  mockApis,
  mockNflStandings,
  mockRankings,
  mockSecStandings,
  mockSleeper,
  mockSoccer,
  mockTeamSchedule,
  saveSleeperUsername,
} from "./support/mockApis";

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
  await page.locator("#league-tab-nfl").click();
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

const openSchedulePicker = async (page: Page) => {
  await openDashboard(page);
  await mockNflStandings(page);
  await page.locator("#league-tab-nfl").click();
  await page.getByRole("button", { name: copy.navRail.schedule }).click();
  const picker = page.locator("#team-schedule-picker");
  await expect(picker).toBeEnabled();

  return picker;
};

// Open states capture the panel so the floating listbox is in frame;
// closed states capture just the field, padded so its label is not cut off.
const screenshotSchedulePicker = async (
  page: Page,
  name: string,
  open = true,
) => {
  const panel = page.getByRole("complementary", { name: copy.league.panel });
  const path = `screenshots/${name}.png`;
  if (open) {
    await panel.screenshot({ path });

    return;
  }
  const box = await panel.locator(".MuiAutocomplete-root").boundingBox();
  if (!box) {
    throw new Error("Team schedule picker is not visible.");
  }
  const pad = 8;
  await page.screenshot({
    path,
    clip: {
      x: box.x - pad,
      y: box.y - pad,
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
};

test.describe("@screenshots team schedule picker", () => {
  test.use({ viewport: viewports.desktop });

  test("empty", async ({ page }) => {
    await openSchedulePicker(page);
    await screenshotSchedulePicker(page, "team-schedule-picker-empty", false);
  });

  test("open", async ({ page }) => {
    const picker = await openSchedulePicker(page);
    await picker.click();
    await expect(page.getByRole("option").first()).toBeVisible();
    await screenshotSchedulePicker(page, "team-schedule-picker-open");
  });

  test("filtered", async ({ page }) => {
    const picker = await openSchedulePicker(page);
    await picker.fill("ch");
    await expect(page.getByRole("option").first()).toBeVisible();
    await screenshotSchedulePicker(page, "team-schedule-picker-filtered");
  });

  test("no matches", async ({ page }) => {
    const picker = await openSchedulePicker(page);
    await picker.fill("zzz");
    await expect(page.getByText(copy.schedule.noTeams)).toBeVisible();
    await screenshotSchedulePicker(page, "team-schedule-picker-no-matches");
  });

  test("selected", async ({ page }) => {
    const picker = await openSchedulePicker(page);
    await picker.fill("seah");
    await page.getByRole("option", { name: "Seahawks" }).click();
    await expect(picker).toHaveValue("Seahawks");
    await screenshotSchedulePicker(
      page,
      "team-schedule-picker-selected",
      false,
    );
  });
});

const openCollegeStandings = async (page: Page) => {
  await openDashboard(page);
  await mockSecStandings(page);
  await page.getByRole("button", { name: copy.navRail.standings }).click();
};

const openTeamSchedule = async (page: Page, team: string) => {
  await mockTeamSchedule(page);
  await page.getByRole("button", { name: copy.navRail.schedule }).click();
  const picker = page.locator("#team-schedule-picker");
  await expect(picker).toBeEnabled();
  await picker.fill(team);
  await page.getByRole("option", { name: team }).click();
  await expect(
    page.getByRole("heading", { name: copy.schedule.table(team) }),
  ).toBeVisible();
};

test.describe("@screenshots light NFL division standings", () => {
  // Tall enough for all eight divisions without scrolling the panel.
  test.use({ viewport: { width: 1440, height: 2500 } });

  test("NFL division standings", async ({ page }) => {
    await openNflStandings(page);
    await page.getByRole("button", { name: copy.theme.toLight }).click();
    await page.getByLabel(copy.league.standingsView).selectOption("division");
    await screenshotLeaguePanel(page, "league-panel-nfl-division-light");
  });
});

test.describe("@screenshots light league panel", () => {
  // Short enough that the panel is not mostly empty space.
  test.use({ viewport: { width: 1440, height: 640 } });

  test("college standings", async ({ page }) => {
    await openCollegeStandings(page);
    await page.getByRole("button", { name: copy.theme.toLight }).click();
    await screenshotLeaguePanel(page, "league-panel-cfb-standings-light");
  });

  test("NFL team schedule", async ({ page }) => {
    await openNflStandings(page);
    await page.getByRole("button", { name: copy.theme.toLight }).click();
    await openTeamSchedule(page, "Seahawks");
    await screenshotLeaguePanel(page, "team-schedule-nfl-light");
  });

  test("college team schedule", async ({ page }) => {
    await openCollegeStandings(page);
    await page.getByRole("button", { name: copy.theme.toLight }).click();
    await openTeamSchedule(page, "Georgia");
    await screenshotLeaguePanel(page, "team-schedule-cfb-light");
  });
});

test.describe("@screenshots game leaders", () => {
  test.use({ viewport: viewports.mobile });

  // Opens the details of the card at `index`: 0 is live, 2 is final.
  const openDetails = async (page: Page, index: number) => {
    await page
      .getByRole("button", { name: copy.gameDetails.toggle })
      .nth(index)
      .click();
  };

  for (const theme of themes) {
    test(`live game, ${theme}`, async ({ page }) => {
      await openDashboard(page);
      if (theme === "light") {
        await switchToLight(page);
      }
      await openDetails(page, 0);
      const leaders = page.locator("#game-leaders-1001");
      await expect(leaders.locator("img")).toHaveCount(6);
      await leaders.screenshot({
        path: `screenshots/game-leaders-live-${theme}.png`,
      });
    });
  }

  test("final game", async ({ page }) => {
    await openDashboard(page);
    await openDetails(page, 2);
    const leaders = page.locator("#game-leaders-1003");
    await expect(leaders.locator("img")).toHaveCount(6);
    await leaders.screenshot({
      path: "screenshots/game-leaders-final-dark.png",
    });
  });
});

test.describe("@screenshots game details dialog", () => {
  // Opens the live game's details and waits for the dialog to finish
  // opening and its headshots to load.
  const openLiveDetails = async (page: Page) => {
    await page
      .getByRole("button", { name: copy.gameDetails.toggle })
      .first()
      .click();
    await expect(page.locator(".MuiDialog-container")).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(page.locator("#game-leaders-1001 img")).toHaveCount(6);
  };

  for (const theme of themes) {
    test(`phone, full screen, ${theme}`, async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await openDashboard(page);
      if (theme === "light") {
        await switchToLight(page);
      }
      await openLiveDetails(page);
      await page.screenshot({
        path: `screenshots/game-details-dialog-mobile-${theme}.png`,
      });
    });
  }

  test("desktop, centered", async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await openDashboard(page);
    await openLiveDetails(page);
    await page.screenshot({
      path: "screenshots/game-details-dialog-desktop-dark.png",
    });
  });

  // The header in each game state: 1001 is live, 1002 upcoming, 1003 final.
  for (const [state, id] of [
    ["live", "1001"],
    ["upcoming", "1002"],
    ["final", "1003"],
  ] as const) {
    test(`header, ${state}`, async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await openDashboard(page);
      await page.locator(`#game-details-${id}-button`).click();
      await expect(page.locator(".MuiDialog-container")).toHaveCSS(
        "opacity",
        "1",
      );
      await page
        .locator(`#game-header-${id}`)
        .screenshot({ path: `screenshots/game-header-${state}-dark.png` });
    });
  }

  test("closed, card button", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await openDashboard(page);
    await page
      .locator("#game-details-1001-button")
      .screenshot({ path: "screenshots/game-details-button-dark.png" });
  });
});

test.describe("@screenshots game stats", () => {
  test.use({ viewport: viewports.mobile });

  for (const [state, id, index] of [
    ["live", "1001", 0],
    ["final", "1003", 2],
  ] as const) {
    test(`team stats, ${state}`, async ({ page }) => {
      await openDashboard(page);
      await page
        .getByRole("button", { name: copy.gameDetails.toggle })
        .nth(index)
        .click();
      await expect(page.locator(".MuiDialog-container")).toHaveCSS(
        "opacity",
        "1",
      );
      const stats = page.locator(`#team-stats-${id}`);
      await expect(stats).toBeVisible();
      await stats.screenshot({
        path: `screenshots/team-stats-${state}-dark.png`,
      });
    });
  }

  for (const [state, gameId, theme] of [
    ["final", "1003", "dark"],
    ["live", "1001", "light"],
  ] as const) {
    test(`scoring summary, ${state}, ${theme}`, async ({ page }) => {
      // Tall enough to show every play without scrolling the dialog.
      await page.setViewportSize({ width: 1280, height: 2000 });
      await openDashboard(page);
      if (theme === "light") {
        await switchToLight(page);
      }
      await page.locator(`#game-details-${gameId}-button`).click();
      await expect(page.locator(".MuiDialog-container")).toHaveCSS(
        "opacity",
        "1",
      );
      const plays = page.locator(`#scoring-plays-${gameId}`);
      await expect(plays).toBeVisible();
      await plays.screenshot({
        path: `screenshots/scoring-plays-${state}-${theme}.png`,
      });
    });
  }

  test("scoring summary, no scores yet", async ({ page }) => {
    await openDashboard(page);
    // The live game's summary with its scoring plays taken out.
    await page.route("https://site.api.espn.com/**/summary*", (route) =>
      route.fulfill({
        json: { ...summaries["1001"], scoringPlays: [] },
      }),
    );
    await page.locator("#game-details-1001-button").click();
    await expect(page.locator(".MuiDialog-container")).toHaveCSS(
      "opacity",
      "1",
    );
    const plays = page.locator("#scoring-plays-1001");
    await expect(plays).toContainText(copy.scoringPlays.none);
    await plays.screenshot({
      path: "screenshots/scoring-plays-empty-dark.png",
    });
  });

  test("team stats, light", async ({ page }) => {
    await openDashboard(page);
    await switchToLight(page);
    await page.locator("#game-details-1001-button").click();
    await expect(page.locator(".MuiDialog-container")).toHaveCSS(
      "opacity",
      "1",
    );
    const stats = page.locator("#team-stats-1001");
    await expect(stats).toBeVisible();
    await stats.screenshot({ path: "screenshots/team-stats-live-light.png" });
  });

  for (const [state, index] of [
    ["live", 0],
    ["upcoming", 1],
    ["final", 2],
  ] as const) {
    test(`card footer, ${state}`, async ({ page }) => {
      await openDashboard(page);
      await page
        .locator("article")
        .nth(index)
        .locator(".card-situation")
        .first()
        .screenshot({ path: `screenshots/card-footer-${state}-dark.png` });
    });
  }
});

test.describe("@screenshots loading placeholders", () => {
  test.use({ viewport: viewports.mobile });

  for (const theme of themes) {
    test(`scoring summary, leaders and team stats, ${theme}`, async ({
      page,
    }) => {
      await openDashboard(page);
      if (theme === "light") {
        await switchToLight(page);
      }
      // Never answer the summary, so the placeholders stay on screen.
      await page.route("https://site.api.espn.com/**/summary*", () => {});
      await page.locator("#game-details-1003-button").click();
      await expect(page.locator(".MuiDialog-container")).toHaveCSS(
        "opacity",
        "1",
      );
      await page.locator("#scoring-plays-skeleton-1003").screenshot({
        path: `screenshots/scoring-plays-loading-${theme}.png`,
      });
      await page
        .locator("#game-leaders-skeleton-1003")
        .screenshot({ path: `screenshots/game-leaders-loading-${theme}.png` });
      await page
        .locator("#team-stats-skeleton-1003")
        .screenshot({ path: `screenshots/team-stats-loading-${theme}.png` });
    });
  }
});

// League tabs and soccer. The Premier League fixture holds finals (one a 1-1
// draw), a match in its 67th minute and upcoming fixtures.
const eplEvent = (match: (state: string, scores: string[]) => boolean) => {
  const event = eplScoreboard.events.find((candidate) =>
    match(
      candidate.status.type.state,
      candidate.competitions[0].competitors.map((team) => team.score),
    ),
  );
  if (!event) {
    throw new Error("The Premier League fixture is missing a game state.");
  }

  return event;
};

const soccerCards = {
  live: eplEvent((state) => state === "in"),
  upcoming: eplEvent((state) => state === "pre"),
  win: eplEvent((state, [a, b]) => state === "post" && a !== b),
  draw: eplEvent((state, [a, b]) => state === "post" && a === b),
};

const openLeague = async (page: Page, league: "ncaaf" | "epl" | "ucl") => {
  await page.clock.setFixedTime(new Date("2026-11-15T21:00:00Z"));
  await mockApis(page);
  await mockSoccer(page);
  await page.goto("./");
  await expect(page.getByText("Ridge Hawks").first()).toBeVisible();
  if (league !== "ncaaf") {
    await page.locator(`#league-tab-${league}`).click();
  }
  await expect(page.locator(`#league-tab-${league}`)).toHaveAttribute(
    "aria-selected",
    "true",
  );
};

test.describe("@screenshots league tabs", () => {
  for (const [device, viewport] of [
    ["desktop", viewports.desktop],
    ["mobile", viewports.mobile],
  ] as const) {
    test.describe(device, () => {
      test.use({ viewport });

      for (const league of ["ncaaf", "epl"] as const) {
        test(`masthead, ${league}`, async ({ page }) => {
          await openLeague(page, league);
          await page.getByRole("banner").screenshot({
            path: `screenshots/masthead-${league}-${device}-dark.png`,
            animations: "disabled",
          });
        });
      }
    });
  }

  test("masthead, light", async ({ page }) => {
    await page.setViewportSize(viewports.desktop);
    await openLeague(page, "ucl");
    await switchToLight(page);
    await page.getByRole("banner").screenshot({
      path: "screenshots/masthead-ucl-desktop-light.png",
      animations: "disabled",
    });
  });

  for (const league of ["ncaaf", "epl"] as const) {
    test(`scores header, ${league}`, async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await openLeague(page, league);
      await page.locator("#scores-header").screenshot({
        path: `screenshots/scores-header-${league}-dark.png`,
        animations: "disabled",
      });
    });
  }

  for (const league of ["epl", "ucl"] as const) {
    test(`week picker, open, ${league}`, async ({ page }) => {
      await page.setViewportSize(viewports.desktop);
      await openLeague(page, league);
      await page.locator("#game-week").click();
      const menu = page.getByRole("listbox");
      await expect(menu).toBeVisible();
      await menu.screenshot({
        path: `screenshots/week-select-${league}-open-dark.png`,
        animations: "disabled",
      });
    });
  }

  test("Premier League scoreboard, mobile", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await openLeague(page, "epl");
    await expect(
      page.locator(`#game-card-${soccerCards.live.id}`),
    ).toBeVisible();
    await page.screenshot({
      path: "screenshots/epl-mobile-dark.png",
      animations: "disabled",
    });
  });
});

test.describe("@screenshots soccer game card", () => {
  test.use({ viewport: viewports.desktop });

  for (const [state, event] of Object.entries(soccerCards)) {
    test(`${state}, dark`, async ({ page }) => {
      await openLeague(page, "epl");
      await page.locator(`#game-card-${event.id}`).screenshot({
        path: `screenshots/game-card-soccer-${state}-dark.png`,
      });
    });
  }

  test("live, light", async ({ page }) => {
    await openLeague(page, "epl");
    await switchToLight(page);
    await page.locator(`#game-card-${soccerCards.live.id}`).screenshot({
      path: "screenshots/game-card-soccer-live-light.png",
    });
  });
});

// Nottingham Forest's crest has its own dark variant; Bournemouth's is the
// same in both themes, so dark mode shows its light file.
test.describe("@screenshots soccer team logo", () => {
  test.use({ viewport: viewports.desktop });

  const logo = (page: Page, abbreviation: string) =>
    page
      .locator(`#game-card-${soccerCards.upcoming.id} .team-logo`)
      .filter({ has: page.locator(`img[src*="/${abbreviation}-"]`) });

  for (const theme of themes) {
    test(`with a dark variant, ${theme}`, async ({ page }) => {
      await openLeague(page, "epl");
      if (theme === "light") {
        await switchToLight(page);
      }
      await logo(page, "393").screenshot({
        path: `screenshots/team-logo-soccer-dark-variant-${theme}.png`,
      });
    });
  }

  test("without a dark variant, dark", async ({ page }) => {
    await openLeague(page, "epl");
    await logo(page, "349").screenshot({
      path: "screenshots/team-logo-soccer-same-dark.png",
    });
  });
});

test.describe("@screenshots soccer league table", () => {
  // Tall enough for the Champions League's 36 teams without scrolling.
  test.use({ viewport: { width: 1440, height: 1900 } });

  for (const league of ["epl", "ucl"] as const) {
    test(`${league}, dark`, async ({ page }) => {
      await openLeague(page, league);
      await page.getByRole("button", { name: copy.navRail.standings }).click();
      await screenshotLeaguePanel(page, `league-table-${league}-dark`);
    });
  }

  test("epl, light", async ({ page }) => {
    await openLeague(page, "epl");
    await switchToLight(page);
    await page.getByRole("button", { name: copy.navRail.standings }).click();
    await screenshotLeaguePanel(page, "league-table-epl-light");
  });

  for (const league of ["epl", "ucl"] as const) {
    test(`${league} zone key`, async ({ page }) => {
      await openLeague(page, league);
      await page.getByRole("button", { name: copy.navRail.standings }).click();
      await page
        .getByRole("list", { name: copy.league.zones })
        .first()
        .screenshot({ path: `screenshots/league-zone-key-${league}.png` });
    });
  }
});

test.describe("@screenshots fantasy players", () => {
  // Opens the live NFL game's details with a saved Sleeper username.
  const openLiveGameDetails = async (page: Page) => {
    await saveSleeperUsername(page);
    await mockApis(page);
    await mockSleeper(page);
    await page.clock.setFixedTime(new Date("2026-11-07T21:00:00Z"));
    await page.goto("./");
    await page.locator("#game-details-1001-button").click();
    await expect(page.locator(".MuiDialog-container")).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(page.locator("#fantasy-player-1001-L1-101")).toBeVisible();
    await expect(page.locator("#game-leaders-1001 img")).toHaveCount(6);
  };

  for (const theme of themes) {
    test(`player list, ${theme}`, async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await openLiveGameDetails(page);
      if (theme === "light") {
        await page.keyboard.press("Escape");
        await switchToLight(page);
        await page.locator("#game-details-1001-button").click();
      }
      await page
        .locator("#fantasy-players-1001")
        .screenshot({ path: `screenshots/fantasy-players-${theme}.png` });
    });
  }

  for (const [device, viewport] of [
    ["mobile", viewports.mobile],
    ["desktop", viewports.desktop],
  ] as const) {
    test(`game details dialog with fantasy players, ${device}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await openLiveGameDetails(page);
      await page.screenshot({
        path: `screenshots/game-details-fantasy-${device}-dark.png`,
      });
    });
  }

  test("Sleeper account dialog", async ({ page }) => {
    await page.setViewportSize(viewports.mobile);
    await saveSleeperUsername(page);
    await mockApis(page);
    await mockSleeper(page);
    await page.goto("./");
    await page.locator("#masthead-menu-button").click();
    await page.getByRole("button", { name: copy.fantasy.account }).click();
    const dialog = page.getByRole("dialog", { name: copy.fantasy.account });
    await expect(dialog).toBeVisible();
    // Let the fade-in finish so the page doesn't show through the dialog.
    await expect(page.locator(".MuiDialog-container").last()).toHaveCSS(
      "opacity",
      "1",
    );
    await dialog.screenshot({ path: "screenshots/sleeper-account-dialog.png" });
  });
});

test.describe("@screenshots desktop notifications button", () => {
  for (const [state, answer, label] of [
    ["off", "granted", copy.scoreNotification.desktopOn],
    ["on", "granted", copy.scoreNotification.desktopOff],
    ["blocked", "denied", copy.scoreNotification.desktopBlocked],
  ] as const) {
    test(state, async ({ page }) => {
      await stubDesktopNotifications(page, answer);
      await openDashboard(page);
      if (state !== "off") {
        await page
          .getByRole("button", { name: copy.scoreNotification.desktopOn })
          .click();
      }
      await page
        .getByRole("button", { name: label })
        .screenshot({ path: `screenshots/desktop-notifications-${state}.png` });
    });
  }
});

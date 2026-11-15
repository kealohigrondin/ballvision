import { expect, test } from "@playwright/test";

import { copy } from "../src/copy";
import eplScoreboard from "./fixtures/epl-scoreboard.json" with { type: "json" };
import scoreboard from "./fixtures/scoreboard.json" with { type: "json" };
import {
  shownNotifications,
  stubDesktopNotifications,
} from "./support/desktopNotifications";
import {
  mockApis,
  mockCollegeStandings,
  mockNflStandings,
  mockSleeper,
  mockSoccer,
} from "./support/mockApis";

// The Premier League fixture's match in progress.
const eplLive = eplScoreboard.events.find(
  (event) => event.status.type.state === "in",
)!;

test.beforeEach(async ({ page }) => {
  await mockApis(page);
});

test("renders the scoreboard from the ESPN feed", async ({ page }) => {
  await page.goto("./");

  const grid = page.getByRole("region", { name: copy.grid.label });

  await expect(
    grid.getByRole("link", { name: "Ridge Hawks", exact: true }),
  ).toBeVisible();
  await expect(
    grid.getByRole("link", { name: "Summit Goats", exact: true }),
  ).toBeVisible();
  await expect(
    grid.getByRole("link", { name: "Lake Herons", exact: true }),
  ).toBeVisible();
});

test("switches between dark and light mode", async ({ page }) => {
  await page.goto("./");

  await page.getByRole("button", { name: copy.theme.toLight }).click();

  await expect(
    page.getByRole("button", { name: copy.theme.toDark }),
  ).toBeVisible();
});

test("remembers the chosen NFL standings view after a reload", async ({
  page,
}) => {
  await mockNflStandings(page);
  await page.goto("./");
  await page.locator("#league-tab-nfl").click();
  await page.getByRole("button", { name: copy.navRail.standings }).click();
  const picker = page.getByLabel(copy.league.standingsView);
  await expect(picker).toHaveValue("wildcard");
  await picker.selectOption("conference");
  await page.reload();
  await expect(page.getByLabel(copy.league.standingsView)).toHaveValue(
    "conference",
  );
});

test("remembers the chosen conference standings after a reload", async ({
  page,
}) => {
  await mockCollegeStandings(page);
  await page.goto("./");
  await page.getByRole("button", { name: copy.navRail.standings }).click();
  const picker = page.getByLabel(copy.league.conference);
  await expect(picker).toHaveValue("sec");
  await picker.selectOption("acc");
  await page.reload();
  await expect(page.getByLabel(copy.league.conference)).toHaveValue("acc");
});

test("titles each NFL division table with the division name", async ({
  page,
}) => {
  await mockNflStandings(page);
  await page.goto("./");
  await page.locator("#league-tab-nfl").click();
  await page.getByRole("button", { name: copy.navRail.standings }).click();
  await page.getByLabel(copy.league.standingsView).selectOption("division");
  const table = page.getByRole("table", { name: /NFC North/ });
  await expect(table.getByRole("columnheader").first()).toHaveText("NFC North");
});

test("lists every college team in the schedule picker", async ({ page }) => {
  await mockCollegeStandings(page);
  await page.goto("./");
  await page.getByRole("button", { name: copy.navRail.schedule }).click();
  await expect(page.getByLabel(copy.league.conference)).toHaveCount(0);
  await page.getByRole("combobox", { name: copy.schedule.team }).click();
  await expect(page.getByRole("option")).toHaveText([
    "Ridge Hawks",
    "Summit Goats",
  ]);
});

test("finds an NFL team by typing in the schedule picker", async ({ page }) => {
  await mockNflStandings(page);
  await page.goto("./");
  await page.locator("#league-tab-nfl").click();
  await page.getByRole("button", { name: copy.navRail.schedule }).click();
  const team = page.getByRole("combobox", { name: copy.schedule.team });
  await team.click();
  await expect(page.getByRole("option")).toHaveCount(32);
  await team.fill("seah");
  await page.getByRole("option", { name: "Seahawks" }).click();
  await expect(
    page.getByRole("heading", { name: copy.schedule.table("Seahawks") }),
  ).toBeVisible();
});

test("shows each team's leaders in a live game's details", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: copy.gameDetails.toggle })
    .first()
    .click();

  await expect(page.locator("#game-leader-1001-home-passing")).toContainText(
    "14/21, 188 YDS, 2 TD",
  );
});

test("leaves leaders out of an upcoming game's details", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: copy.gameDetails.toggle })
    .nth(1)
    .click();

  await expect(page.locator("#game-leaders-1002")).toHaveCount(0);
});

test("opens a game's details in a dialog named for the matchup", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator("#game-details-1001-button").click();

  await expect(
    page.getByRole("dialog", {
      name: copy.gameDetails.title("River Otters", "Ridge Hawks"),
    }),
  ).toBeVisible();
});

test("closes the game details dialog with the Escape key", async ({ page }) => {
  await page.goto("./");
  await page.locator("#game-details-1001-button").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");

  await expect(page.getByRole("dialog")).toBeHidden();
});

test("compares the teams' stats in a game's details", async ({ page }) => {
  await page.goto("./");
  await page.locator("#game-details-1001-button").click();

  await expect(page.locator("#team-stat-1001-totalYards")).toContainText("185");
});

test("lists both teams' scoring plays in one list in a game's details", async ({
  page,
}) => {
  await page.goto("./");
  await page.locator("#game-details-1003-button").click();
  const plays = page.locator("#scoring-plays-1003 li li");

  await expect(plays).toHaveCount(9);
  await expect(plays.last()).toContainText("L. Duarte 1 Yd Run");
});

test("shows the stadium in place of kickoff on an upcoming game's card", async ({
  page,
}) => {
  await page.goto("./");

  await expect(
    page.locator("article").nth(1).locator(".card-situation").first(),
  ).toContainText("Summit Stadium");
});

test.describe("Sleeper fantasy players", () => {
  // Saves a username on the NFL tab and opens the live game's details.
  test.beforeEach(async ({ page }) => {
    await mockSleeper(page);
    await page.goto("./");
    await page.locator("#league-tab-nfl").click();
    await page.getByRole("button", { name: copy.fantasy.account }).click();
    await page.locator("#sleeper-account-input").fill("AaronY");
    await page.locator("#sleeper-account-save").click();
    await page.locator("#game-details-1001-button").click();
  });

  test("shows your players in the details of their NFL game", async ({
    page,
  }) => {
    await expect(page.locator("#fantasy-player-1001-L1-101")).toContainText(
      "Riley Hawk",
    );
  });

  test("lists your players below the last play and above the stats", async ({
    page,
  }) => {
    const top = async (selector: string) =>
      (await page.locator(selector).boundingBox())?.y ?? NaN;
    await expect(page.locator("#game-leaders-1001")).toBeVisible();
    const players = await top("#fantasy-players-1001");

    expect(players).toBeGreaterThan(await top("#game-last-play-1001"));
    expect(players).toBeLessThan(await top("#game-leaders-1001"));
  });
});

test.describe("league tabs", () => {
  test.beforeEach(async ({ page }) => {
    // Soccer weeks follow the clock: on Nov 15, the Premier League's next
    // matchweek is Nov 17-23, the week the fixture's matches are in.
    await page.clock.setFixedTime(new Date("2026-11-15T21:00:00Z"));
    await mockSoccer(page);
  });

  test("names the current Premier League week like football's", async ({
    page,
  }) => {
    await page.goto("./");
    await page.locator("#league-tab-epl").click();
    const matchweek = copy.week.matchweek(0).replace("0", "\\d+");
    await expect(page.locator("#game-week")).toHaveText(
      new RegExp(`${matchweek} · \\D+ 17-23`),
    );
  });

  test("shows the Premier League scoreboard on the EPL tab", async ({
    page,
  }) => {
    await page.goto("./");
    await page.locator("#league-tab-epl").click();
    await expect(page.locator(`#game-card-${eplLive.id}`)).toBeVisible();
  });

  test("offers FBS and FCS only on the NCAAF tab", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("#division-control")).toBeVisible();
    await page.locator("#league-tab-ucl").click();
    await expect(page.locator("#division-control")).toBeHidden();
  });

  test("moves the tab indicator under the chosen league", async ({ page }) => {
    await page.goto("./");
    await page.locator("#league-tab-ucl").click();
    const tab = await page.locator("#league-tab-ucl").boundingBox();
    await expect
      .poll(async () => {
        const indicator = await page
          .locator("header .MuiTabs-indicator")
          .boundingBox();

        return Math.round(indicator?.x ?? 0);
      })
      .toBe(Math.round(tab?.x ?? -1));
  });

  test("remembers the chosen league after a reload", async ({ page }) => {
    await page.goto("./");
    await page.locator("#league-tab-ucl").click();
    await expect(page.locator("#league-tab-ucl")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.reload();
    await expect(page.locator("#league-tab-ucl")).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("shows the Premier League table in the league panel", async ({
    page,
  }) => {
    await page.goto("./");
    await page.locator("#league-tab-epl").click();
    await page.getByRole("button", { name: copy.navRail.standings }).click();
    await expect(
      page.locator("#league-table-title-2026-27-english-premier-league"),
    ).toBeVisible();
  });

  test("lists what each run of table positions earns", async ({ page }) => {
    await page.goto("./");
    await page.locator("#league-tab-epl").click();
    await page.getByRole("button", { name: copy.navRail.standings }).click();
    await expect(
      page.locator("#league-zones-2026-27-english-premier-league"),
    ).toHaveText(
      /1–4\s*Champions League\s*5\s*Europa League\s*18–20\s*Relegation/,
    );
  });
});

test.describe("desktop notifications", () => {
  test.beforeEach(async ({ page }) => {
    await stubDesktopNotifications(page);
    // Pin the live game so its scores raise alerts.
    await page.addInitScript(() =>
      localStorage.setItem("ballvision:favorites:v1", JSON.stringify(["1001"])),
    );
  });

  test("confirms on the desktop when turned on", async ({ page }) => {
    await page.goto("./");
    await page
      .getByRole("button", { name: copy.scoreNotification.desktopOn })
      .click();

    await expect
      .poll(() => shownNotifications(page))
      .toEqual([
        expect.objectContaining({
          title: copy.scoreNotification.desktopReadyTitle,
        }),
      ]);
  });

  test("sends a pinned game's score to the desktop while another window has focus", async ({
    page,
  }) => {
    await page.goto("./");
    await page
      .getByRole("button", { name: copy.scoreNotification.desktopOn })
      .click();
    await expect(
      page.getByRole("button", { name: copy.scoreNotification.desktopOff }),
    ).toBeVisible();
    await page.evaluate(() => {
      document.hasFocus = () => false;
    });
    // The home team scores a touchdown: 24 becomes 31.
    const scored = structuredClone(scoreboard);
    const live = scored.events.find((event) => event.id === "1001")!;
    const home = live.competitions[0].competitors.find(
      (team) => team.homeAway === "home",
    )!;
    Object.assign(home, { score: "31" });
    await page.route("https://site.api.espn.com/**/scoreboard*", (route) =>
      route.fulfill({ json: scored }),
    );
    await page.getByRole("button", { name: copy.sync.refresh }).click();

    await expect
      .poll(async () => (await shownNotifications(page)).at(-1)?.body ?? "")
      .toContain("31");
  });
});

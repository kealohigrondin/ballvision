import { expect, test } from "@playwright/test";

import { copy } from "../src/copy";
import eplScoreboard from "./fixtures/epl-scoreboard.json" with { type: "json" };
import {
  mockApis,
  mockCollegeStandings,
  mockNflStandings,
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

test("shows a live game's leaders in its game details", async ({ page }) => {
  await page.goto("./");
  await page
    .getByRole("button", { name: copy.gameDetails.toggle })
    .first()
    .click();

  await expect(page.locator("#game-leader-1001-passing")).toContainText(
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

test.describe("league tabs", () => {
  test.beforeEach(async ({ page }) => {
    await mockSoccer(page);
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
});

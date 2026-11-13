import { expect, test } from "@playwright/test";

import { copy } from "../src/copy";
import {
  mockApis,
  mockCollegeStandings,
  mockNflStandings,
} from "./support/mockApis";

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
  await page
    .getByRole("button", { name: copy.scoresHeader.divisions.nfl })
    .click();
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
  await page
    .getByRole("button", { name: copy.scoresHeader.divisions.nfl })
    .click();
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
  await page
    .getByRole("button", { name: copy.scoresHeader.divisions.nfl })
    .click();
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

test("on phones, the sticky scores header covers the gutters beside game cards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 402, height: 874 });
  await page.goto("./");
  await expect(
    page.getByRole("link", { name: "Ridge Hawks", exact: true }),
  ).toBeVisible();
  // Scroll the first card under the header.
  await page.evaluate(() => window.scrollTo(0, 200));

  const header = await page.locator("#scores-header").boundingBox();
  const card = await page
    .getByRole("region", { name: copy.grid.label })
    .locator("article")
    .first()
    .boundingBox();
  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );

  expect(header?.y).toBe(0);
  // The header's background reaches the screen edges, past the card shadows.
  expect(header?.x).toBe(0);
  expect((header?.x ?? 0) + (header?.width ?? 0)).toBe(402);
  expect(card?.x).toBeGreaterThan(0);
  expect((card?.x ?? 0) + (card?.width ?? 0)).toBeLessThan(402);
  // Without horizontal scrolling.
  expect(pageWidth).toBe(402);
});

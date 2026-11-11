import { expect, test } from "@playwright/test";

import { copy } from "../src/copy";
import { mockApis, mockNflStandings } from "./support/mockApis";

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

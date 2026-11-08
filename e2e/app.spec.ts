import { expect, test } from "@playwright/test";

import { copy } from "../src/copy";
import { mockApis } from "./support/mockApis";

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

test("uses a 12px baseline for body text, selects and their options", async ({
  page,
}) => {
  await page.goto("./");

  const fontSize = (locator: ReturnType<typeof page.locator>) =>
    locator.evaluate((element) => getComputedStyle(element).fontSize);

  expect(await fontSize(page.locator("body"))).toBe("12px");
  const week = page.getByRole("combobox", { name: copy.week.label });
  expect(await fontSize(week)).toBe("12px");
  await week.click();
  expect(await fontSize(page.getByRole("option").first())).toBe("12px");
});

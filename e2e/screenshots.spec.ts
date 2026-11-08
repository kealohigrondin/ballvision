import { expect, type Page, test } from "@playwright/test";

import { copy } from "../src/copy";
import { mockApis } from "./support/mockApis";

// Captures reference screenshots for pull requests. Run with
// `npm run screenshots`; images are written to ./screenshots.
const viewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

const openDashboard = async (page: Page) => {
  // A fixed clock keeps the "Updated" timestamp stable between runs.
  await page.clock.setFixedTime(new Date("2026-11-07T21:00:00Z"));
  await mockApis(page);
  await page.goto("./");
  await expect(page.getByText("Ridge Hawks").first()).toBeVisible();
};

test.describe("@screenshots", () => {
  for (const [name, viewport] of Object.entries(viewports)) {
    test(`${name} dark`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openDashboard(page);
      await page.screenshot({
        path: `screenshots/${name}-dark.png`,
        fullPage: true,
      });
    });

    test(`${name} light`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openDashboard(page);
      await page.getByRole("button", { name: copy.theme.toLight }).click();
      await page.screenshot({
        path: `screenshots/${name}-light.png`,
        fullPage: true,
      });
    });
  }
});

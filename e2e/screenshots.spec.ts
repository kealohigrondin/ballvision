import { expect, type Page, test } from "@playwright/test";

import { copy } from "../src/copy";
import { mockApis } from "./support/mockApis";

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

test.describe("@screenshots", () => {
  for (const [device, viewport] of Object.entries(viewports)) {
    for (const theme of themes) {
      test(`${device} ${theme}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await openDashboard(page);
        if (theme === "light") {
          await page.getByRole("button", { name: copy.theme.toLight }).click();
        }
        await page.screenshot({ path: `screenshots/${device}-${theme}.png` });
      });
    }
  }
});

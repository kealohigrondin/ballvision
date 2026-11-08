import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import MastHead from "../src/components/MastHead";
import { MASTHEAD_ICON_SIZE } from "../src/components/MastHeadIconButton";
import { copy } from "../src/copy";
import { AppTheme } from "../src/providers/AppTheme";
import { AppDataTestProvider, createAppData } from "./helpers/appData";

afterEach(cleanup);

it("renders every masthead button as an icon button the size of the pause button", () => {
  render(
    <AppTheme>
      <AppDataTestProvider value={createAppData()}>
        <MastHead />
      </AppDataTestProvider>
    </AppTheme>,
  );
  const header = screen.getByRole("banner");
  const buttons = within(header).getAllByRole("button");
  expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
    copy.sync.pause,
    copy.sync.refresh,
    copy.scoreNotification.enableSound,
    copy.scoreNotification.test,
    copy.theme.toLight,
  ]);
  for (const button of buttons) {
    expect(button.textContent).toBe("");
    const icons = button.querySelectorAll("svg");
    expect(icons).toHaveLength(1);
    expect(icons[0].getAttribute("width")).toBe(String(MASTHEAD_ICON_SIZE));
    expect(icons[0].getAttribute("height")).toBe(String(MASTHEAD_ICON_SIZE));
  }
});

it("gives every masthead icon button a hover hint matching its accessible name", () => {
  render(
    <AppTheme>
      <AppDataTestProvider value={createAppData()}>
        <MastHead />
      </AppDataTestProvider>
    </AppTheme>,
  );
  const buttons = within(screen.getByRole("banner")).getAllByRole("button");
  expect(buttons.length).toBeGreaterThan(0);
  for (const button of buttons) {
    const name = button.getAttribute("aria-label");
    expect(name).toBeTruthy();
    expect(button.getAttribute("title")).toBe(name);
  }
});

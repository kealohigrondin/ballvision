import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import MastHead from "../src/components/MastHead";
import { MASTHEAD_ICON_SIZE } from "../src/components/MastHeadIconButton";
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
    "Pause auto-refresh",
    "Refresh scores",
    "Enable chaos sounds",
    "Test score notification",
    "Switch to light mode",
  ]);
  for (const button of buttons) {
    expect(button.textContent).toBe("");
    const icons = button.querySelectorAll("svg");
    expect(icons).toHaveLength(1);
    expect(icons[0].getAttribute("width")).toBe(String(MASTHEAD_ICON_SIZE));
    expect(icons[0].getAttribute("height")).toBe(String(MASTHEAD_ICON_SIZE));
  }
});

it("shows the enable-sound label in a tooltip instead of a native title", async () => {
  render(
    <AppTheme>
      <AppDataTestProvider value={createAppData()}>
        <MastHead />
      </AppDataTestProvider>
    </AppTheme>,
  );
  const enable = screen.getByRole("button", { name: "Enable chaos sounds" });
  expect(enable.hasAttribute("title")).toBe(false);
  fireEvent.mouseOver(enable);
  expect((await screen.findByRole("tooltip")).textContent).toBe(
    "Enable chaos sounds",
  );
});

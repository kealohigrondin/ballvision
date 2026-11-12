import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

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

const stubWindow = (compact: boolean) =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: compact,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );

const renderMastHead = () =>
  render(
    <AppTheme>
      <AppDataTestProvider value={createAppData()}>
        <MastHead />
      </AppDataTestProvider>
    </AppTheme>,
  );

it("puts the masthead controls behind a menu button on phones", () => {
  stubWindow(true);

  try {
    renderMastHead();
    const header = screen.getByRole("banner");
    expect(header.querySelector("#masthead-menu-button")).toBeTruthy();
    expect(
      within(header).queryByRole("button", { name: copy.sync.pause }),
    ).toBeNull();
  } finally {
    vi.unstubAllGlobals();
  }
});

it("shows the masthead controls without a menu button on wider screens", () => {
  stubWindow(false);

  try {
    renderMastHead();
    const header = screen.getByRole("banner");
    expect(header.querySelector("#masthead-menu-button")).toBeNull();
    expect(
      within(header).getByRole("button", { name: copy.sync.pause }),
    ).toBeTruthy();
  } finally {
    vi.unstubAllGlobals();
  }
});

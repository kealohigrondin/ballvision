import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { GameGrid } from "../src/components/GameGrid";
import type { AppData } from "../src/context/appDataContext";
import type { EspnData } from "../src/context/espnDataContext";
import { AppDataTestProvider, createAppData } from "./helpers/appData";

const grid = (
  overrides: Partial<EspnData> & Pick<Partial<AppData>, "filter"> = {},
) => (
  <AppDataTestProvider
    value={createAppData({ filter: overrides.filter ?? "all" })}
    espn={overrides}
  >
    <GameGrid />
  </AppDataTestProvider>
);
afterEach(cleanup);

describe("GameGrid states", () => {
  it("shows loading placeholders only before the first successful load", () => {
    const { rerender } = render(grid({ loading: true, updatedAt: null }));
    expect(screen.getByLabelText("Loading scores")).toBeTruthy();
    expect(screen.queryByText("No games on this field.")).toBeNull();
    rerender(grid({ loading: true }));
    expect(screen.queryByLabelText("Loading scores")).toBeNull();
    expect(screen.getByText("No games on this field.")).toBeTruthy();
  });
  it("owns the pinned and failed-request empty messages", () => {
    const { rerender } = render(grid({ filter: "pinned" }));
    expect(screen.getByText("Your watchlist starts here.")).toBeTruthy();
    rerender(grid({ filter: "pinned", error: "offline", updatedAt: null }));
    expect(screen.getByText("The feed is taking a timeout.")).toBeTruthy();
    rerender(grid({ error: "offline" }));
    expect(screen.getByText("No games on this field.")).toBeTruthy();
  });
});

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { copy } from "@/copy";
import { GameGrid } from "@/features/scores/GameGrid";
import type { ScoresData } from "@/features/scores/scoresContext";
import type { AppData } from "@/shared/appData/appDataContext";

import { AppDataTestProvider, createAppData } from "./helpers/appData";

const grid = (
  overrides: Partial<ScoresData> & Pick<Partial<AppData>, "filter"> = {},
) => (
  <AppDataTestProvider
    value={createAppData({ filter: overrides.filter ?? "all" })}
    scores={overrides}
  >
    <GameGrid />
  </AppDataTestProvider>
);
afterEach(cleanup);

describe("GameGrid states", () => {
  it("shows loading placeholders only before the first successful load", () => {
    const { rerender } = render(grid({ loading: true, updatedAt: null }));
    expect(screen.getByLabelText(copy.grid.loading)).toBeTruthy();
    expect(screen.queryByText(copy.grid.noGames)).toBeNull();
    rerender(grid({ loading: true }));
    expect(screen.queryByLabelText(copy.grid.loading)).toBeNull();
    expect(screen.getByText(copy.grid.noGames)).toBeTruthy();
  });
  it("owns the pinned and failed-request empty messages", () => {
    const { rerender } = render(grid({ filter: "pinned" }));
    expect(screen.getByText(copy.grid.watchlistEmpty)).toBeTruthy();
    rerender(grid({ filter: "pinned", error: "offline", updatedAt: null }));
    expect(screen.getByText(copy.grid.feedDown)).toBeTruthy();
    rerender(grid({ error: "offline" }));
    expect(screen.getByText(copy.grid.noGames)).toBeTruthy();
  });
});

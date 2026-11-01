import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GameGrid } from "../src/components/GameGrid";
import type { Game } from "../src/data/types";

const props = {
  games: [] as Game[],
  loading: false,
  hasLoaded: true,
  hasError: false,
  pinnedOnly: false,
  favoriteIds: [],
  onToggleFavorite: () => {},
};
afterEach(cleanup);

describe("GameGrid states", () => {
  it("shows loading placeholders only before the first successful load", () => {
    const { rerender } = render(
      <GameGrid {...props} loading hasLoaded={false} />,
    );
    expect(screen.getByLabelText("Loading scores")).toBeTruthy();
    expect(screen.queryByText("No games on this field.")).toBeNull();
    rerender(<GameGrid {...props} loading />);
    expect(screen.queryByLabelText("Loading scores")).toBeNull();
    expect(screen.getByText("No games on this field.")).toBeTruthy();
  });
  it("owns the pinned and failed-request empty messages", () => {
    const { rerender } = render(<GameGrid {...props} pinnedOnly />);
    expect(screen.getByText("Your watchlist starts here.")).toBeTruthy();
    rerender(<GameGrid {...props} pinnedOnly hasError hasLoaded={false} />);
    expect(screen.getByText("The feed is taking a timeout.")).toBeTruthy();
    rerender(<GameGrid {...props} hasError />);
    expect(screen.getByText("No games on this field.")).toBeTruthy();
  });
});

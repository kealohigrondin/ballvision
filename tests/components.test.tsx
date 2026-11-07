import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameCard } from "../src/components/GameCard";
import { TeamLogo } from "../src/components/TeamLogo";
import { SyncControls } from "../src/components/SyncControls";
import type { Game, Team } from "../src/data/types";

const home: Team = {
  id: "home",
  name: "Home",
  abbreviation: "HOM",
  color: "#112233",
  score: "14",
  quarters: ["7", "7"],
};
const away: Team = {
  ...home,
  id: "away",
  name: "Away",
  abbreviation: "AWY",
  score: "7",
  quarters: ["0", "7"],
};
const game: Game = {
  id: "game",
  home,
  away,
  state: "live",
  status: "In Progress",
  clock: "3:42",
  period: 2,
  start: "2026-10-31T19:00:00Z",
  broadcast: "ESPN",
  venue: "Stadium",
  possession: "away",
  situation: "3rd & 4",
  lastPlay: "Pass complete.",
  redZone: true,
  homeTimeouts: 2,
  awayTimeouts: 1,
};
afterEach(cleanup);

describe("scoreboard presentation", () => {
  it("aligns both teams under shared period and total columns, including overtime", () => {
    render(
      <GameCard
        game={{
          ...game,
          period: 5,
          away: { ...away, quarters: ["0", "7", "0", "0", "3"] },
          home: { ...home, quarters: ["7", "7", "0", "0", "0"] },
        }}
        favorite={false}
        onFavorite={() => {}}
      />,
    );
    const scoreboard = screen.getByRole("table", {
      name: "Away at Home scores by period",
    });
    const headings = within(scoreboard)
      .getAllByRole("columnheader", { hidden: true })
      .map((cell) => cell.textContent);
    expect(headings).toEqual(["OVERTIME", "1", "2", "3", "4", "1OT", "T"]);
    const rows = within(scoreboard).getAllByRole("row");
    expect(
      within(rows[1])
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["0", "7", "0", "0", "3", "7"]);
    expect(
      within(rows[2])
        .getAllByRole("cell")
        .map((cell) => cell.textContent),
    ).toEqual(["7", "7", "0", "0", "0", "14"]);
  });

  it("renders live game context, period scores, and pin action", () => {
    const onFavorite = vi.fn();
    render(<GameCard game={game} favorite={false} onFavorite={onFavorite} />);
    expect(screen.getByText("Q2 · 3:42")).toBeTruthy();
    expect(screen.getByText("RED ZONE ·")).toBeTruthy();
    expect(screen.getByText("ESPN")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Game details" }));
    expect(screen.getByText("Pass complete.")).toBeTruthy();
    expect(
      screen.getByRole("table", { name: "Score by period", hidden: true }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Favorite Away at Home" }),
    );
    expect(onFavorite).toHaveBeenCalledOnce();
  });
  it("omits unavailable optional details and live indicators for scheduled games", () => {
    render(
      <GameCard
        game={{
          ...game,
          state: "upcoming",
          broadcast: "",
          venue: "",
          lastPlay: "",
          home: { ...home, quarters: [] },
          away: { ...away, quarters: [] },
        }}
        favorite
        onFavorite={() => {}}
      />,
    );
    expect(screen.queryByText("RED ZONE ·")).toBeNull();
    expect(screen.queryByText("ESPN")).toBeNull();
    expect(screen.queryByLabelText("Possession")).toBeNull();
    expect(
      screen.getByText("Additional details are not available yet."),
    ).toBeTruthy();
    expect(screen.getAllByText("—")).toHaveLength(2);
  });
  it("falls back to a team abbreviation if its logo cannot load", () => {
    const { container } = render(
      <TeamLogo team={{ ...home, logo: "https://example.com/logo.png" }} />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByText("HOM")).toBeTruthy();
  });
  it("reflects pause and loading state through accessible controls", () => {
    const onTogglePause = vi.fn();
    const { rerender } = render(
      <SyncControls
        loading={false}
        paused
        error={null}
        updatedAt={null}
        onTogglePause={onTogglePause}
        onRefresh={() => {}}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Resume auto-refresh" }),
    );
    expect(onTogglePause).toHaveBeenCalledOnce();
    rerender(
      <SyncControls
        loading
        paused={false}
        error={null}
        updatedAt={null}
        onTogglePause={onTogglePause}
        onRefresh={() => {}}
      />,
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Refresh scores",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByRole("status").textContent).toBe("Updating…");
  });
});

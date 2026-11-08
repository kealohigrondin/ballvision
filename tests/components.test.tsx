import {
  cleanup,
  fireEvent,
  render as renderWithoutTheme,
  screen,
  within,
} from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GameCard } from "../src/components/GameCard";
import { SyncControls } from "../src/components/SyncControls";
import { TeamLogo } from "../src/components/TeamLogo";
import type { PolymarketData } from "../src/context/polymarketDataContext";
import type { Game, Team } from "../src/data/types";
import { AppTheme } from "../src/providers/AppTheme";
import { AppDataTestProvider, createAppData } from "./helpers/appData";
import { oddsQuote } from "./helpers/oddsFixture";

const render = (ui: ReactNode, polymarket?: Partial<PolymarketData>) =>
  renderWithoutTheme(ui, {
    wrapper: ({ children }) => (
      <AppTheme>
        <AppDataTestProvider value={createAppData()} polymarket={polymarket}>
          {children}
        </AppDataTestProvider>
      </AppTheme>
    ),
  });

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
  it("displays only the favored team odds before the pin button and labels stale quotes", () => {
    const { container } = render(
      <GameCard game={game} favorite={false} onFavorite={() => {}} />,
      { quotes: { [game.id]: oddsQuote }, error: true },
    );
    const link = screen.getByRole("link", { name: "AWY -300" });
    expect(link.getAttribute("href")).toBe(oddsQuote.url);
    expect(link.textContent).toContain("AWY -300");
    expect(link.textContent).not.toContain("HOM");
    expect(link.parentElement?.title).toContain("stale");
    const actions = container.querySelector(".favorite")?.parentElement;
    expect(actions?.firstElementChild?.contains(link)).toBe(true);
    expect(actions?.lastElementChild?.getAttribute("aria-label")).toBe(
      "Favorite Away at Home",
    );
  });
  it("switches to the home team when it has the higher probability", () => {
    render(<GameCard game={game} favorite={false} onFavorite={() => {}} />, {
      quotes: {
        [game.id]: {
          ...oddsQuote,
          awayProbability: 0.25,
          homeProbability: 0.75,
        },
      },
    });
    const link = screen.getByRole("link", { name: "HOM -300" });
    expect(link.textContent).not.toContain("AWY");
  });
  it("shows even odds without favoring either team when probabilities tie", () => {
    render(<GameCard game={game} favorite={false} onFavorite={() => {}} />, {
      quotes: {
        [game.id]: { ...oddsQuote, awayProbability: 0.5, homeProbability: 0.5 },
      },
    });
    expect(screen.getByRole("link", { name: "Even odds" })).toBeTruthy();
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
      <AppDataTestProvider
        value={createAppData({
          paused: true,
          setPaused: onTogglePause,
        })}
        espn={{ updatedAt: null }}
      >
        <SyncControls />
      </AppDataTestProvider>,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Resume auto-refresh" }),
    );
    expect(onTogglePause).toHaveBeenCalledOnce();
    rerender(
      <AppDataTestProvider
        value={createAppData({
          setPaused: onTogglePause,
        })}
        espn={{ loading: true, updatedAt: null }}
      >
        <SyncControls />
      </AppDataTestProvider>,
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

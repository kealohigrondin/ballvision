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
import { copy } from "../src/copy";
import type { Game, Team } from "../src/data/types";
import { AppTheme } from "../src/providers/AppTheme";
import { gameTime } from "../src/utils/gameTime";
import { AppDataTestProvider, createAppData } from "./helpers/appData";
import { oddsQuote } from "./helpers/oddsFixture";
import { linkTo } from "./helpers/queries";

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
        onFavorite={() => { }}
      />,
    );
    const scoreboard = screen.getByRole("table", {
      name: copy.gameCard.scoresByPeriod(away.name, home.name),
    });
    const headings = within(scoreboard)
      .getAllByRole("columnheader", { hidden: true })
      .map((cell) => cell.textContent);
    expect(headings[0]).toBeTruthy();
    expect(headings.at(-1)).toBe(copy.periodScores.total);
    expect(headings).toHaveLength(7);
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
    const { container } = render(
      <GameCard game={game} favorite={false} onFavorite={onFavorite} />,
    );
    expect(screen.getByText(gameTime(game))).toBeTruthy();
    const card = container.querySelector("article");
    expect(card?.classList.contains("red-zone")).toBe(true);
    expect(screen.getByText(game.broadcast)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: copy.gameDetails.toggle }),
    );
    expect(screen.getByText(game.lastPlay)).toBeTruthy();
    expect(
      screen.getByRole("table", {
        name: copy.periodScores.label,
        hidden: true,
      }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", {
        name: copy.gameCard.favorite(false, away.name, home.name),
      }),
    );
    expect(onFavorite).toHaveBeenCalledOnce();
  });
  it("displays only the favored team odds before the pin button and labels stale quotes", () => {
    const { container } = render(
      <GameCard game={game} favorite={false} onFavorite={() => { }} />,
      { quotes: { [game.id]: oddsQuote }, error: true },
    );
    const link = linkTo(oddsQuote.url);
    expect(link.textContent).toContain("AWY");
    expect(link.textContent).not.toContain("HOM");
    expect(link.parentElement?.title).toContain(copy.odds.stale);
    const actions = container.querySelector(".favorite")?.parentElement;
    expect(actions?.firstElementChild?.contains(link)).toBe(true);
    expect(actions?.lastElementChild?.getAttribute("aria-label")).toBe(
      copy.gameCard.favorite(false, away.name, home.name),
    );
  });
  it("switches to the home team when it has the higher probability", () => {
    render(<GameCard game={game} favorite={false} onFavorite={() => { }} />, {
      quotes: {
        [game.id]: {
          ...oddsQuote,
          awayProbability: 0.25,
          homeProbability: 0.75,
        },
      },
    });
    const link = linkTo(oddsQuote.url);
    expect(link.textContent).toContain("HOM");
    expect(link.textContent).not.toContain("AWY");
  });
  it("shows even odds without favoring either team when probabilities tie", () => {
    render(<GameCard game={game} favorite={false} onFavorite={() => { }} />, {
      quotes: {
        [game.id]: { ...oddsQuote, awayProbability: 0.5, homeProbability: 0.5 },
      },
    });
    const link = linkTo(oddsQuote.url);
    expect(link.textContent).not.toContain("AWY");
    expect(link.textContent).not.toContain("HOM");
  });
  it("omits unavailable optional details and live indicators for scheduled games", () => {
    const { container } = render(
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
        onFavorite={() => { }}
      />,
    );
    const card = container.querySelector("article");
    expect(card?.classList.contains("red-zone")).toBe(false);
    expect(screen.queryByText(game.broadcast)).toBeNull();
    expect(screen.queryByLabelText(copy.gameCard.possession)).toBeNull();
    expect(screen.getByText(copy.gameDetails.unavailable)).toBeTruthy();
    expect(screen.getAllByText(copy.common.emptyValue)).toHaveLength(2);
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
    fireEvent.click(screen.getByRole("button", { name: copy.sync.resume }));
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
          name: copy.sync.refresh,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByRole("status").textContent).toBe(copy.sync.updating);
  });
});

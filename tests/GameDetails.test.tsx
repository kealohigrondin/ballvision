import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { copy } from "@/copy";
import { GameDetails } from "@/features/scores/GameDetails";
import { GameHeader } from "@/features/scores/GameHeader";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import type { Game, Team } from "@/shared/types";

import { AppDataTestProvider, createAppData } from "./helpers/appData";

afterEach(cleanup);

const team = (name: string): Team => ({
  id: name,
  name,
  abbreviation: name.slice(0, 3).toUpperCase(),
  color: "#000000",
  score: "0",
  quarters: [],
});

const game: Game = {
  id: "401",
  away: team("Duke"),
  home: team("Miami"),
  state: "live",
  status: "",
  clock: "",
  period: 1,
  start: "2026-11-14T00:00:00Z",
  broadcast: "",
  venue: "",
  situation: "",
  lastPlay: "Pass complete for 12 yards.",
  redZone: false,
};

// The details read app data and the game summary from context.
const renderDetails = () =>
  render(
    <AppDataTestProvider value={createAppData({ paused: true })}>
      <GameDetails game={game} />
    </AppDataTestProvider>,
  );

const openDetails = () => {
  renderDetails();
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
};

it("keeps the details out of the page until they are opened", () => {
  renderDetails();
  expect(screen.queryByText(game.lastPlay)).toBeNull();
});

it("opens the details in a dialog named for the matchup", () => {
  openDetails();
  expect(
    screen.getByRole("dialog", {
      name: copy.gameDetails.title(game.away.name, game.home.name),
    }),
  ).toBeTruthy();
});

it("shows the game's details inside the dialog", () => {
  openDetails();
  expect(screen.getByRole("dialog").textContent).toContain(game.lastPlay);
});

it("closes the dialog from its close button", async () => {
  openDetails();
  fireEvent.click(screen.getByRole("button", { name: copy.gameDetails.close }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("closes the dialog with the Escape key", async () => {
  openDetails();
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("asks to close when the close button is pressed", () => {
  const onClose = vi.fn();
  render(
    <ResponsiveDialog
      id="dialog"
      open
      onClose={onClose}
      title="Title"
      closeLabel="Close"
    >
      Body
    </ResponsiveDialog>,
  );
  fireEvent.click(document.getElementById("dialog-close")!);
  expect(onClose).toHaveBeenCalledOnce();
});

const renderHeader = (overrides: Partial<Game> = {}) =>
  render(<GameHeader game={{ ...game, ...overrides }} />);

it("shows both teams' scores once a game has started", () => {
  renderHeader({
    away: { ...game.away, score: "17" },
    home: { ...game.home, score: "24" },
  });
  expect(
    document.getElementById(`game-header-score-401-${game.home.id}`)
      ?.textContent,
  ).toBe("24");
});

it("leaves scores blank before kickoff", () => {
  renderHeader({ state: "upcoming" });
  expect(
    document.getElementById(`game-header-score-401-${game.away.id}`)
      ?.textContent,
  ).toBe("");
});

it("marks the team with the ball during a live game", () => {
  renderHeader({ possession: game.home.id });
  expect(
    screen.getAllByRole("img", { name: copy.gameCard.possession }),
  ).toHaveLength(1);
});

it("shows the broadcast network", () => {
  renderHeader({ broadcast: "SEC Network" });
  expect(document.getElementById("game-header-401")?.textContent).toContain(
    "SEC Network",
  );
});

it("puts the score by period in the header", () => {
  renderHeader({
    away: { ...game.away, quarters: ["7"] },
    home: { ...game.home, quarters: ["3"] },
  });
  expect(
    screen.getByRole("table", { name: copy.periodScores.label }),
  ).toBeTruthy();
});

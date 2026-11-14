import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { FantasyPlayerList } from "../src/components/FantasyPlayerList";
import { GameDetails } from "../src/components/GameDetails";
import { TextPromptDialog } from "../src/components/TextPromptDialog";
import { copy } from "../src/copy";
import type { FantasyLeague } from "../src/data/types";
import { AppTheme } from "../src/providers/AppTheme";
import { PolymarketGameProvider } from "../src/providers/PolymarketGameProvider";
import { AppDataTestProvider, createAppData } from "./helpers/appData";
import { oddsGame, oddsQuote } from "./helpers/oddsFixture";

afterEach(cleanup);

const league = (team: string): FantasyLeague => ({
  id: "L1",
  name: "Fanal Fantasy",
  players: [
    {
      id: "p1",
      name: "Starter Sam",
      position: "QB",
      team,
      points: 12.76,
      starter: true,
    },
    {
      id: "p2",
      name: "Bench Ben",
      position: "WR",
      team,
      points: 3,
      starter: false,
    },
  ],
});

it("shows each player's points to one decimal place", () => {
  render(<FantasyPlayerList id="g1" leagues={[league("BUF")]} />);
  expect(
    document.getElementById("fantasy-player-g1-L1-p1")?.textContent,
  ).toContain(copy.fantasy.points(12.76));
});

it("marks bench players", () => {
  render(<FantasyPlayerList id="g1" leagues={[league("BUF")]} />);
  expect(
    document.getElementById("fantasy-player-g1-L1-p2")?.textContent,
  ).toContain(copy.fantasy.bench);
});

it("does not mark starters as bench players", () => {
  render(<FantasyPlayerList id="g1" leagues={[league("BUF")]} />);
  expect(
    document.getElementById("fantasy-player-g1-L1-p1")?.textContent,
  ).not.toContain(copy.fantasy.bench);
});

const showDetails = (leagues: FantasyLeague[]) => {
  render(
    <AppTheme>
      <AppDataTestProvider
        value={createAppData({ paused: true })}
        polymarket={{ quotes: { [oddsGame.id]: oddsQuote } }}
        sleeper={{ leagues }}
      >
        <PolymarketGameProvider game={oddsGame}>
          <GameDetails game={oddsGame} />
        </PolymarketGameProvider>
      </AppDataTestProvider>
    </AppTheme>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
};

it("shows fantasy players above the Polymarket chart in game details", async () => {
  showDetails([league(oddsGame.away.abbreviation)]);
  const odds = await screen.findByRole("region", {
    name: copy.oddsHistory.label,
  });
  const players = document.getElementById(`fantasy-players-${oddsGame.id}`)!;
  expect(
    players.compareDocumentPosition(odds) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

it("leaves out fantasy players on teams not in the game", () => {
  showDetails([league("KC")]);
  expect(document.getElementById(`fantasy-players-${oddsGame.id}`)).toBeNull();
});

const showPrompt = (onSave = vi.fn(), onClose = vi.fn()) => {
  render(
    <TextPromptDialog
      id="prompt"
      open
      title="Account"
      label="Username"
      initialValue="old"
      saveLabel="Save"
      cancelLabel="Cancel"
      onSave={onSave}
      onClose={onClose}
    />,
  );

  return { onSave, onClose };
};

it("saves the entered text without surrounding spaces", () => {
  const { onSave } = showPrompt();
  fireEvent.change(document.getElementById("prompt-input")!, {
    target: { value: "  AaronY " },
  });
  fireEvent.click(document.getElementById("prompt-save")!);
  expect(onSave).toHaveBeenCalledWith("AaronY");
});

it("closes without saving when cancelled", () => {
  const { onSave, onClose } = showPrompt();
  fireEvent.click(document.getElementById("prompt-cancel")!);
  expect([onSave.mock.calls.length, onClose.mock.calls.length]).toEqual([0, 1]);
});

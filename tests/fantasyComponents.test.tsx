import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { AppTheme } from "@/app/AppTheme";
import { copy } from "@/copy";
import { EspnFantasyControl } from "@/features/fantasy/EspnFantasyControl";
import { FantasyPlayerList } from "@/features/fantasy/FantasyPlayerList";
import { GameFantasyPlayers } from "@/features/fantasy/GameFantasyPlayers";
import type { FantasyLeague } from "@/features/fantasy/types";
import { TextPromptDialog } from "@/shared/components/TextPromptDialog";

import { AppDataTestProvider, createAppData } from "./helpers/appData";
import { oddsGame } from "./helpers/oddsFixture";

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

const showGamePlayers = (leagues: FantasyLeague[]) =>
  render(
    <AppTheme>
      <AppDataTestProvider value={createAppData()} fantasy={{ leagues }}>
        <GameFantasyPlayers game={oddsGame} />
      </AppDataTestProvider>
    </AppTheme>,
  );

it("lists fantasy players on a team in the game", () => {
  showGamePlayers([league(oddsGame.away.abbreviation)]);
  expect(
    document.getElementById(`fantasy-players-${oddsGame.id}`),
  ).not.toBeNull();
});

it("leaves out fantasy players on teams not in the game", () => {
  showGamePlayers([league("KC")]);
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

it("opens the ESPN team link dialog from its settings button", () => {
  render(
    <AppTheme>
      <AppDataTestProvider value={createAppData()}>
        <EspnFantasyControl />
      </AppDataTestProvider>
    </AppTheme>,
  );
  fireEvent.click(
    document.querySelector(
      `button[aria-label="${copy.fantasy.espnAccount}"]`,
    ) as HTMLElement,
  );
  expect(document.getElementById("espn-fantasy-team-input")).not.toBeNull();
});

it("saves the pasted ESPN team link", () => {
  const setEspnFantasyTeam = vi.fn();
  render(
    <AppTheme>
      <AppDataTestProvider value={createAppData({ setEspnFantasyTeam })}>
        <EspnFantasyControl />
      </AppDataTestProvider>
    </AppTheme>,
  );
  fireEvent.click(
    document.querySelector(
      `button[aria-label="${copy.fantasy.espnAccount}"]`,
    ) as HTMLElement,
  );
  const link = "https://fantasy.espn.com/football/team?leagueId=1&teamId=2";
  fireEvent.change(
    document.getElementById("espn-fantasy-team-input") as HTMLElement,
    { target: { value: link } },
  );
  fireEvent.submit(
    document.getElementById("espn-fantasy-team-form") as HTMLElement,
  );
  expect(setEspnFantasyTeam).toHaveBeenCalledWith(link);
});

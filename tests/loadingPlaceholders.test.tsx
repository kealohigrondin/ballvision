import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { AppTheme } from "@/app/AppTheme";
import { copy } from "@/copy";
import { GameOddsDetails } from "@/features/odds/GameOddsDetails";
import { PolymarketGameProvider } from "@/features/odds/PolymarketGameProvider";
import { GameDetails } from "@/features/scores/GameDetails";
import type { GameSummary, GameSummarySource } from "@/features/scores/types";
import type { Game, Team } from "@/shared/types";

import { AppDataTestProvider, createAppData } from "./helpers/appData";

afterEach(cleanup);

const team = (id: string): Team => ({
  id,
  name: id,
  abbreviation: id,
  color: "#000000",
  score: "7",
  quarters: [],
});

const game: Game = {
  id: "401",
  away: team("DUKE"),
  home: team("MIA"),
  state: "final",
  status: "Final",
  clock: "",
  period: 4,
  start: "2026-11-14T00:00:00Z",
  broadcast: "",
  venue: "",
  situation: "",
  lastPlay: "",
  redZone: false,
};

const summary: GameSummary = {
  leaders: {
    away: [
      {
        category: "passing",
        id: "1",
        name: "D. Mensah",
        position: "QB",
        jersey: "10",
        team: "DUKE",
        stats: "8/9, 60 YDS",
      },
    ],
    home: [],
  },
  stats: [
    {
      key: "totalYards",
      away: "275",
      home: "468",
      awayValue: 275,
      homeValue: 468,
    },
  ],
};

// Opens the game's details with a summary source; the dialog's content
// mounts on open, which starts the summary request.
const openDetails = (summarySource: GameSummarySource) => {
  render(
    <AppTheme>
      <AppDataTestProvider
        value={createAppData({ paused: true })}
        scores={{ summarySource }}
      >
        <GameDetails game={game} />
      </AppDataTestProvider>
    </AppTheme>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
};

const pending: GameSummarySource = {
  load: vi.fn(() => new Promise<GameSummary>(() => undefined)),
};

it("holds the leaders section's place while the summary loads", () => {
  openDetails(pending);
  expect(document.getElementById("game-leaders-skeleton-401")).not.toBeNull();
});

it("holds the team stats section's place while the summary loads", () => {
  openDetails(pending);
  expect(document.getElementById("team-stats-skeleton-401")).not.toBeNull();
});

it("replaces the leaders placeholder once the summary arrives", async () => {
  openDetails({ load: vi.fn().mockResolvedValue(summary) });
  await screen.findByRole("region", { name: copy.gameLeaders.title });
  expect(document.getElementById("game-leaders-skeleton-401")).toBeNull();
});

it("replaces the team stats placeholder once the summary arrives", async () => {
  openDetails({ load: vi.fn().mockResolvedValue(summary) });
  await screen.findByRole("region", { name: copy.teamStats.title });
  expect(document.getElementById("team-stats-skeleton-401")).toBeNull();
});

const showOdds = (loading: boolean) =>
  render(
    <AppTheme>
      <AppDataTestProvider
        value={createAppData({ paused: true })}
        polymarket={{ quotes: {}, loading }}
      >
        <PolymarketGameProvider game={{ ...game, state: "live" }}>
          <GameOddsDetails />
        </PolymarketGameProvider>
      </AppDataTestProvider>
    </AppTheme>,
  );

it("holds the odds section's place while the game's quote loads", () => {
  showOdds(true);
  expect(
    screen.getByRole("generic", { name: copy.oddsHistory.loading }),
  ).toBeTruthy();
});

it("explains a missing market once odds have loaded", () => {
  showOdds(false);
  expect(screen.getByText(copy.gameDetails.chartUnavailable)).toBeTruthy();
});

it("loads no football summary for a soccer match", () => {
  const load = vi.fn(() => new Promise<GameSummary>(() => undefined));
  render(
    <AppTheme>
      <AppDataTestProvider
        value={createAppData({ paused: true })}
        scores={{ summarySource: { load } }}
      >
        <GameDetails game={{ ...game, sport: "soccer" }} />
      </AppDataTestProvider>
    </AppTheme>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
  expect(load).not.toHaveBeenCalled();
});

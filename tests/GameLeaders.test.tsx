import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { copy } from "@/copy";
import { GameDetails } from "@/features/scores/GameDetails";
import { GameLeaders } from "@/features/scores/GameLeaders";
import type { GameLeader, GameSummary } from "@/features/scores/types";
import type { Game, Team } from "@/shared/types";

import { AppDataTestProvider, createAppData } from "./helpers/appData";

afterEach(cleanup);

const team = (id: string): Team => ({
  id,
  name: id,
  abbreviation: id,
  color: "#000000",
  score: "0",
  quarters: [],
});

const leader = (overrides: Partial<GameLeader> = {}): GameLeader => ({
  category: "passing",
  id: "1",
  name: "D. Mensah",
  position: "QB",
  jersey: "10",
  team: "DUKE",
  stats: "8/9, 60 YDS",
  ...overrides,
});

const away = team("DUKE");
const home = team("MIA");

const showLeaders = (leaders: GameSummary["leaders"]) =>
  render(
    <GameLeaders gameId="401" away={away} home={home} leaders={leaders} />,
  );

it("shows the away team's leader in the away column", () => {
  showLeaders({ away: [leader()], home: [] });
  expect(
    document.getElementById("game-leader-401-away-passing")?.textContent,
  ).toContain("8/9, 60 YDS");
});

it("shows the home team's leader in the home column", () => {
  showLeaders({
    away: [],
    home: [leader({ name: "G. Stockton", team: "MIA" })],
  });
  expect(
    document.getElementById("game-leader-401-home-passing")?.textContent,
  ).toContain("G. Stockton");
});

it("labels each leader with their position and number", () => {
  showLeaders({ away: [leader()], home: [] });
  expect(
    document.getElementById("game-leader-401-away-passing")?.textContent,
  ).toContain(copy.gameLeaders.detail("QB", "10", ""));
});

it("leaves out a category neither team has a leader for", () => {
  showLeaders({ away: [leader()], home: [] });
  expect(screen.queryByText(copy.gameLeaders.categories.receiving)).toBeNull();
});

const game: Game = {
  id: "401",
  away,
  home,
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

it("leaves the leaders section out when the summary has none", async () => {
  render(
    <AppDataTestProvider
      value={createAppData({ paused: true })}
      scores={{
        summarySource: {
          load: vi.fn().mockResolvedValue({
            leaders: { away: [], home: [] },
            stats: [],
          }),
        },
      }}
    >
      <GameDetails game={game} />
    </AppDataTestProvider>,
  );
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
  await screen.findByRole("dialog");
  expect(document.getElementById("game-leaders-401")).toBeNull();
});

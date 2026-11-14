import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { copy } from "@/copy";
import { GameDetails } from "@/features/scores/GameDetails";
import type { Game, GameLeader, Team } from "@/shared/types";

afterEach(cleanup);

const team = (id: string): Team => ({
  id,
  name: id,
  abbreviation: id,
  color: "#000000",
  score: "0",
  quarters: [],
});

const passer: GameLeader = {
  category: "passing",
  id: "1",
  name: "D. Mensah",
  position: "QB",
  jersey: "10",
  team: "MIA",
  stats: "8/9, 60 YDS",
};

const game = (leaders?: GameLeader[]): Game => ({
  id: "401",
  away: team("DUKE"),
  home: team("MIA"),
  state: "live",
  status: "",
  clock: "",
  period: 1,
  start: "2026-11-14T00:00:00Z",
  broadcast: "",
  venue: "",
  situation: "",
  lastPlay: "",
  redZone: false,
  ...(leaders && { leaders }),
});

const openDetails = (shown: Game) => {
  render(<GameDetails game={shown} />);
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
};

it("shows each leader's stats in the open game details", () => {
  openDetails(game([passer]));
  expect(
    document.getElementById("game-leader-401-passing")?.textContent,
  ).toContain("8/9, 60 YDS");
});

it("labels each leader with their position, number and team", () => {
  openDetails(game([passer]));
  expect(
    document.getElementById("game-leader-401-passing")?.textContent,
  ).toContain(copy.gameLeaders.detail("QB", "10", "MIA"));
});

it("leaves the leaders section out when a game has no leaders", () => {
  openDetails(game());
  expect(document.getElementById("game-leaders-401")).toBeNull();
});

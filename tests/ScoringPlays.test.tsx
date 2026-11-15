import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { copy } from "@/copy";
import { ScoringPlays } from "@/features/scores/ScoringPlays";
import type { ScoringPlay } from "@/features/scores/types";
import type { Team } from "@/shared/types";

afterEach(cleanup);

const team = (id: string): Team => ({
  id,
  name: id,
  abbreviation: id,
  color: "#000000",
  score: "0",
  quarters: [],
});

const play = (overrides: Partial<ScoringPlay> = {}): ScoringPlay => ({
  id: "1",
  side: "home",
  period: 1,
  clock: "5:54",
  type: "TD",
  text: "J. Mateer 8 Yd Run (T. Sandell Kick)",
  awayScore: 0,
  homeScore: 7,
  ...overrides,
});

const showPlays = (plays: ScoringPlay[]) =>
  render(
    <ScoringPlays
      gameId="401"
      away={team("MISS")}
      home={team("OU")}
      plays={plays}
    />,
  );

it("lists both teams' plays in one list in order", () => {
  showPlays([
    play({ id: "1", side: "home" }),
    play({ id: "2", side: "away", awayScore: 7, homeScore: 7 }),
  ]);
  const rows = [...document.querySelectorAll("#scoring-plays-401 li li")].map(
    (row) => row.id,
  );
  expect(rows).toEqual(["scoring-play-401-1", "scoring-play-401-2"]);
});

it("puts each play under its quarter's heading", () => {
  showPlays([play({ id: "1", period: 1 }), play({ id: "2", period: 3 })]);
  expect(
    screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent),
  ).toEqual([copy.scoringPlays.period(1), copy.scoringPlays.period(3)]);
});

it("reads out the score after each play", () => {
  showPlays([play()]);
  expect(document.getElementById("scoring-play-401-1")?.textContent).toContain(
    copy.scoringPlays.score("MISS", 0, "OU", 7),
  );
});

it("says there is no scoring yet when a game has no scores", () => {
  showPlays([]);
  expect(document.getElementById("scoring-plays-none-401")?.textContent).toBe(
    copy.scoringPlays.none,
  );
});

it("names quarters and overtimes", () => {
  expect([1, 2, 3, 4, 5, 6].map(copy.scoringPlays.period)).toEqual([
    "1st Quarter",
    "2nd Quarter",
    "3rd Quarter",
    "4th Quarter",
    "Overtime",
    "2nd Overtime",
  ]);
});

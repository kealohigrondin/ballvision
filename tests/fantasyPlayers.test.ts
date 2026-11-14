import { expect, it } from "vitest";

import type { FantasyLeague, Game, Team } from "../src/data/types";
import { fantasyLeaguesForGame } from "../src/utils/fantasyPlayers";

const team = (abbreviation: string): Team => ({
  id: abbreviation,
  name: abbreviation,
  abbreviation,
  color: "#000000",
  score: "0",
  quarters: [],
});

const game = { away: team("BUF"), home: team("WSH") } as Game;

const player = (id: string, teamAbbreviation: string) => ({
  id,
  name: id,
  position: "WR",
  team: teamAbbreviation,
  points: 0,
  starter: true,
});

const leagues: FantasyLeague[] = [
  {
    id: "L1",
    name: "League one",
    players: [player("a", "BUF"), player("b", "KC"), player("c", "WSH")],
  },
  { id: "L2", name: "League two", players: [player("d", "KC")] },
];

it("keeps each league's players on either team in the game", () => {
  expect(
    fantasyLeaguesForGame(leagues, game).map((league) =>
      league.players.map(({ id }) => id),
    ),
  ).toEqual([["a", "c"]]);
});

it("leaves out leagues with no players in the game", () => {
  expect(
    fantasyLeaguesForGame(leagues, game).map((league) => league.id),
  ).toEqual(["L1"]);
});

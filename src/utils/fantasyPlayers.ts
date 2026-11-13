import type { FantasyLeague, Game } from "../data/types";

// Each league's players on either team in the game; leagues with none are
// left out.
export const fantasyLeaguesForGame = (
  leagues: readonly FantasyLeague[],
  game: Game,
): FantasyLeague[] => {
  const teams = [game.away.abbreviation, game.home.abbreviation];

  return leagues.flatMap((league) => {
    const players = league.players.filter((player) =>
      teams.includes(player.team),
    );

    return players.length > 0 ? [{ ...league, players }] : [];
  });
};

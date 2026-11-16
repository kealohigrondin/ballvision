import { useMemo } from "react";

import type { Game } from "@/shared/types";

import { useFantasyData } from "./fantasyDataContext";
import { FantasyPlayerList } from "./FantasyPlayerList";
import { fantasyLeaguesForGame } from "./fantasyPlayers";

type GameFantasyPlayersProps = { game: Game };

// Your fantasy players on either team in a game; nothing when there are none.
export const GameFantasyPlayers = ({ game }: GameFantasyPlayersProps) => {
  const { leagues } = useFantasyData();

  const fantasyLeagues = useMemo(
    () => fantasyLeaguesForGame(leagues, game),
    [leagues, game],
  );

  return (
    fantasyLeagues.length > 0 && (
      <FantasyPlayerList leagues={fantasyLeagues} id={game.id} />
    )
  );
};

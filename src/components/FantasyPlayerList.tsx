import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "../copy";
import type { FantasyLeague } from "../data/types";

type FantasyPlayerListProps = {
  leagues: readonly FantasyLeague[];
  /** Keeps element ids unique when the list renders more than once. */
  id: string;
};

// Lists fantasy players grouped by league, with each player's points and
// whether they are starting.
export const FantasyPlayerList = ({ leagues, id }: FantasyPlayerListProps) => {
  const groups = leagues.map((league) => {
    const rows = league.players.map((player) => (
      <Stack
        component="li"
        key={player.id}
        id={`fantasy-player-${id}-${league.id}-${player.id}`}
        direction="row"
        spacing={1}
        sx={{ alignItems: "baseline", justifyContent: "space-between" }}
      >
        <Typography component="span" sx={{ minWidth: 0 }}>
          {player.name}{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            {copy.fantasy.playerDetails(player.position, player.team)}
            {!player.starter && ` · ${copy.fantasy.bench}`}
          </Typography>
        </Typography>
        <Typography
          component="span"
          sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
        >
          {copy.fantasy.points(player.points)}
        </Typography>
      </Stack>
    ));

    return (
      <Stack
        component="section"
        key={league.id}
        id={`fantasy-league-${id}-${league.id}`}
        spacing={0.5}
        aria-label={league.name}
      >
        <Typography variant="caption" color="text.secondary">
          {league.name}
        </Typography>
        <Stack
          component="ul"
          spacing={0.5}
          sx={{ m: 0, p: 0, listStyle: "none" }}
        >
          {rows}
        </Stack>
      </Stack>
    );
  });

  return (
    <Stack id={`fantasy-players-${id}`} spacing={1}>
      <Typography component="h3" sx={{ fontWeight: 600 }}>
        {copy.fantasy.title}
      </Typography>
      {groups}
    </Stack>
  );
};

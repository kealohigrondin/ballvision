import Grid from "@mui/material/Grid";
import { useMemo } from "react";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { copy } from "../copy";
import { getGameGridSize } from "../utils/gameGridLayout";
import { EmptyState } from "./EmptyState";
import { GameCard } from "./GameCard";
import { LoadingGrid } from "./LoadingGrid";

type GameGridProps = Record<string, never>;

export const GameGrid = ({}: GameGridProps) => {
  const {
    panelOpen: compact,
    filter,
    favoriteIds,
    toggleFavorite: onToggleFavorite,
  } = useAppData();
  const { visibleGames: games, loading, updatedAt, error } = useEspnData();
  const hasLoaded = updatedAt !== null;
  const hasError = Boolean(error);
  const pinnedOnly = filter === "pinned";

  const emptyTitle = useMemo(() => {
    if (hasError && !hasLoaded) {
      return copy.grid.feedDown;
    }
    if (pinnedOnly) {
      return copy.grid.watchlistEmpty;
    }

    return copy.grid.noGames;
  }, [hasError, hasLoaded, pinnedOnly]);

  const emptyDetail = useMemo(() => {
    if (hasError && !hasLoaded) {
      return copy.grid.feedDownDetail;
    }
    if (pinnedOnly) {
      return copy.grid.watchlistEmptyDetail;
    }

    return copy.grid.noGamesDetail;
  }, [hasError, hasLoaded, pinnedOnly]);

  if (loading && !hasLoaded) {
    return <LoadingGrid compact={compact} />;
  }
  if (!games.length) {
    return <EmptyState title={emptyTitle} detail={emptyDetail} />;
  }

  const size = getGameGridSize(compact);
  const cards = games.map((game) => (
    <Grid key={game.id} size={size}>
      <GameCard
        game={game}
        favorite={favoriteIds.includes(game.id)}
        onFavorite={() => onToggleFavorite(game.id)}
      />
    </Grid>
  ));

  return (
    <Grid
      container
      component="section"
      spacing={1.5}
      className="game-grid"
      aria-label={copy.grid.label}
      sx={{ alignItems: "flex-start" }}
    >
      {cards}
    </Grid>
  );
};

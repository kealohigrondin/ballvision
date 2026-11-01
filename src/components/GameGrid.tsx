import Grid from "@mui/material/Grid";
import { getGameGridSize } from "../utils/gameGridLayout";
import "./styles/GameGrid.css";
import type { Game } from "../data/types";
import { GameCard } from "./GameCard";
import { EmptyState } from "./EmptyState";
import { LoadingGrid } from "./LoadingGrid";
import { useMemo } from "react";

type GameGridProps = {
  games: readonly Game[];
  compact?: boolean;
  loading: boolean;
  hasLoaded: boolean;
  hasError: boolean;
  pinnedOnly: boolean;
  favoriteIds: readonly string[];
  onToggleFavorite: (gameId: string) => void;
};

export const GameGrid = ({
  games,
  compact = false,
  loading,
  hasLoaded,
  hasError,
  pinnedOnly,
  favoriteIds,
  onToggleFavorite,
}: GameGridProps) => {
  const emptyTitle = useMemo(() => {
    if (hasError && !hasLoaded) {
      return "The feed is taking a timeout.";
    }
    if (pinnedOnly) {
      return "Your watchlist starts here.";
    }
    return "No games on this field.";
  }, [hasError, hasLoaded, pinnedOnly]);

  const emptyDetail = useMemo(() => {
    if (hasError && !hasLoaded) {
      return "Try refreshing to reconnect to ESPN.";
    }
    if (pinnedOnly) {
      return "Use the star on a game to pin it to the top of your scoreboard.";
    }
    return "Try another date, division, or filter.";
  }, [hasError, hasLoaded, pinnedOnly]);

  if (loading && !hasLoaded) return <LoadingGrid compact={compact} />;
  if (!games.length)
    return <EmptyState title={emptyTitle} detail={emptyDetail} />;

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
      aria-label="College football games"
    >
      {cards}
    </Grid>
  );
};

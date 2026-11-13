import Grid from "@mui/material/Grid";
import { type ReactNode, useMemo } from "react";

import { copy } from "@/copy";
import { useAppData } from "@/shared/appData/appDataContext";
import { EmptyState } from "@/shared/components/EmptyState";
import type { Game } from "@/shared/types";

import { GameCard } from "./GameCard";
import { getGameGridSize } from "./gameGridLayout";
import { LoadingGrid } from "./LoadingGrid";
import { useScoresData } from "./scoresContext";

type GameGridProps = {
  /** Renders one game; defaults to a plain game card. */
  renderCard?: (game: Game) => ReactNode;
};

const defaultRenderCard = (game: Game) => <GameCard game={game} />;

export const GameGrid = ({ renderCard = defaultRenderCard }: GameGridProps) => {
  const { panelOpen: compact, filter } = useAppData();
  const { visibleGames: games, loading, updatedAt, error } = useScoresData();
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
      {renderCard(game)}
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

import { useMemo } from "react";

import type { Division, Filter, Week } from "@/shared/types";

import type { ScoreboardSource } from "./types";
import { useScoreboard } from "./useScoreboard";
import { useSeasonCalendar } from "./useSeasonCalendar";

export type ScoresOptions = {
  division: Division;
  week: Week | null;
  paused: boolean;
  filter: Filter;
  search: string;
  favoriteIds: readonly string[];
};

// The live scoreboard for one division and week, plus the filtered games and
// per-filter counts the scores header shows.
export const useScoresState = (
  source: ScoreboardSource,
  { division, week, paused, filter, search, favoriteIds }: ScoresOptions,
) => {
  const scoreboard = useScoreboard(source, { division, week }, paused);
  const calendar = useSeasonCalendar(source, division);
  const { games } = scoreboard;

  const counts = useMemo(
    () => ({
      all: games.length,
      live: games.filter((game) => game.state === "live").length,
      upcoming: games.filter((game) => game.state === "upcoming").length,
      final: games.filter((game) => game.state === "final").length,
      pinned: games.filter((game) => favoriteIds.includes(game.id)).length,
    }),
    [games, favoriteIds],
  );

  const visibleGames = useMemo(() => {
    const pinned = (id: string) => favoriteIds.includes(id);

    return games
      .filter(
        (game) =>
          (filter === "all" ||
            (filter === "pinned" ? pinned(game.id) : game.state === filter)) &&
          `${game.home.name} ${game.home.abbreviation} ${game.away.name} ${game.away.abbreviation}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
      .sort((a, b) => Number(pinned(b.id)) - Number(pinned(a.id)));
  }, [games, filter, search, favoriteIds]);

  return {
    games,
    loading: scoreboard.loading,
    error: scoreboard.error,
    updatedAt: scoreboard.updatedAt,
    refresh: scoreboard.refresh,
    weeks: calendar.weeks,
    currentWeekId: calendar.currentWeekId,
    counts,
    visibleGames,
  };
};

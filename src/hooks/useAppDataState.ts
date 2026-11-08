import { useMemo, useState } from "react";
import type {
  Division,
  LeagueSource,
  ScoreboardSource,
  Week,
} from "../data/types";
import { useScoreboard } from "./useScoreboard";
import { useSeasonCalendar } from "./useSeasonCalendar";
import { useFavorites } from "./useFavorites";

export type Filter = "all" | "live" | "upcoming" | "final" | "pinned";

type AppDataSources = { source: ScoreboardSource; leagueSource: LeagueSource };

export const useAppDataState = ({ source, leagueSource }: AppDataSources) => {
  const [panelOpen, setPanelOpen] = useState(true);
  const [week, setWeek] = useState<Week | null>(null);
  const [division, setDivisionState] = useState<Division>("fbs");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);
  const { games, loading, error, updatedAt, refresh } = useScoreboard(
    source,
    { division, week },
    paused,
  );
  const calendar = useSeasonCalendar(source, division);

  // FBS and FCS share the college calendar; NFL weeks mean something else.
  const setDivision = (next: Division) => {
    if ((next === "nfl") !== (division === "nfl")) setWeek(null);
    setDivisionState(next);
  };

  const favorites = useFavorites();

  const counts = useMemo(() => {
    const pinned = (id: string) => favorites.ids.includes(id);
    return {
      all: games.length,
      live: games.filter((g) => g.state === "live").length,
      upcoming: games.filter((g) => g.state === "upcoming").length,
      final: games.filter((g) => g.state === "final").length,
      pinned: games.filter((g) => pinned(g.id)).length,
    };
  }, [games, favorites.ids]);

  const visible = useMemo(() => {
    const pinned = (id: string) => favorites.ids.includes(id);
    return games
      .filter(
        (g) =>
          (filter === "all" ||
            (filter === "pinned" ? pinned(g.id) : g.state === filter)) &&
          `${g.home.name} ${g.home.abbreviation} ${g.away.name} ${g.away.abbreviation}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
      .sort((a, b) => Number(pinned(b.id)) - Number(pinned(a.id)));
  }, [games, filter, search, favorites.ids]);

  return {
    panelOpen,
    setPanelOpen,
    week,
    setWeek,
    weeks: calendar.weeks,
    currentWeekId: calendar.currentWeekId,
    division,
    setDivision,
    filter,
    setFilter,
    search,
    setSearch,
    paused,
    setPaused,
    games,
    loading,
    error,
    updatedAt,
    refresh,
    favoriteIds: favorites.ids,
    toggleFavorite: favorites.toggle,
    counts,
    visibleGames: visible,
    leagueSource,
  };
};

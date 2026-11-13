import { useEffect, useState } from "react";

import type { Filter } from "../context/appDataTypes";
import type { Division, NflStandingsView, Week } from "../data/types";
import {
  loadAppPreferences,
  saveAppPreferences,
} from "../utils/appPreferences";
import { useFavorites } from "./useFavorites";

export type { Filter } from "../context/appDataTypes";

export const useAppDataState = () => {
  const [initial] = useState(loadAppPreferences);
  const [panelOpen, setPanelOpen] = useState(initial.panelOpen);
  const [week, setWeek] = useState<Week | null>(initial.week);
  const [division, setDivisionState] = useState<Division>(initial.division);
  const [filter, setFilter] = useState<Filter>(initial.filter);
  const [search, setSearch] = useState(initial.search);
  const [paused, setPaused] = useState(initial.paused);
  const [nflStandingsView, setNflStandingsView] = useState<NflStandingsView>(
    initial.nflStandingsView,
  );
  const [standingsConferenceId, setStandingsConferenceId] = useState(
    initial.standingsConferenceId,
  );
  const favorites = useFavorites();

  useEffect(() => {
    saveAppPreferences({
      panelOpen,
      week,
      division,
      filter,
      search,
      paused,
      nflStandingsView,
      standingsConferenceId,
    });
  }, [
    panelOpen,
    week,
    division,
    filter,
    search,
    paused,
    nflStandingsView,
    standingsConferenceId,
  ]);

  // FBS and FCS share the college calendar; NFL weeks mean something else.
  const setDivision = (next: Division) => {
    if ((next === "nfl") !== (division === "nfl")) {
      setWeek(null);
    }
    setDivisionState(next);
  };

  return {
    panelOpen,
    setPanelOpen,
    week,
    setWeek,
    division,
    setDivision,
    filter,
    setFilter,
    search,
    setSearch,
    paused,
    setPaused,
    nflStandingsView,
    setNflStandingsView,
    standingsConferenceId,
    setStandingsConferenceId,
    favoriteIds: favorites.ids,
    toggleFavorite: favorites.toggle,
  };
};

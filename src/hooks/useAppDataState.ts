import { useEffect, useState } from "react";
import type { Division, Week } from "../data/types";
import {
  loadAppPreferences,
  saveAppPreferences,
} from "../utils/appPreferences";
import type { Filter } from "../context/appDataTypes";
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
  const favorites = useFavorites();
  useEffect(() => {
    saveAppPreferences({ panelOpen, week, division, filter, search, paused });
  }, [panelOpen, week, division, filter, search, paused]);
  // FBS and FCS share the college calendar; NFL weeks mean something else.
  const setDivision = (next: Division) => {
    if ((next === "nfl") !== (division === "nfl")) setWeek(null);
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
    favoriteIds: favorites.ids,
    toggleFavorite: favorites.toggle,
  };
};

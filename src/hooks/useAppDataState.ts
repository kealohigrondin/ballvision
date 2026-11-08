import { useEffect, useState } from "react";
import type { Division } from "../data/types";
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
  const [date, setDate] = useState(initial.date);
  const [division, setDivision] = useState<Division>(initial.division);
  const [filter, setFilter] = useState<Filter>(initial.filter);
  const [search, setSearch] = useState(initial.search);
  const [paused, setPaused] = useState(initial.paused);
  const favorites = useFavorites();
  useEffect(() => {
    saveAppPreferences({ panelOpen, date, division, filter, search, paused });
  }, [panelOpen, date, division, filter, search, paused]);
  return {
    panelOpen,
    setPanelOpen,
    date,
    setDate,
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

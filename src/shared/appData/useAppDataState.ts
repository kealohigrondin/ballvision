import { useCallback, useEffect, useState } from "react";

import type {
  Division,
  Filter,
  NflStandingsView,
  PanelView,
  TeamRef,
  Week,
} from "@/shared/types";

import { loadAppPreferences, saveAppPreferences } from "./appPreferences";
import { useFavorites } from "./useFavorites";

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
  const [selectedPanelView, setPanelView] = useState<PanelView>("standings");
  const [selectedTeam, setSelectedTeam] = useState<TeamRef>();
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

  // The NFL has no polls, so its panel falls back to standings.
  const panelView =
    division === "nfl" && selectedPanelView === "rankings"
      ? "standings"
      : selectedPanelView;

  const setDivision = (next: Division) => {
    // FBS and FCS share the college calendar; NFL weeks mean something else.
    if ((next === "nfl") !== (division === "nfl")) {
      setWeek(null);
    }
    // Team ids only mean something within one division.
    if (next !== division) {
      setSelectedTeam(undefined);
    }
    setDivisionState(next);
  };

  // Picks a team and shows its page in the league panel.
  const selectTeam = useCallback((team: TeamRef) => {
    setSelectedTeam(team);
    setPanelView("schedule");
  }, []);

  return {
    panelOpen,
    setPanelOpen,
    panelView,
    setPanelView,
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
    selectedTeam,
    selectTeam,
    favoriteIds: favorites.ids,
    toggleFavorite: favorites.toggle,
  };
};

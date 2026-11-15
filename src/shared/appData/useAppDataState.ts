import { useCallback, useEffect, useState } from "react";

import { hasRankings, leagueOf } from "@/shared/leagues";
import type {
  Division,
  Filter,
  League,
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
  // The college division the NCAAF tab returns to.
  const [collegeDivision, setCollegeDivision] = useState<Division>(
    leagueOf(initial.division) === "ncaaf" ? initial.division : "fbs",
  );
  const [filter, setFilter] = useState<Filter>(initial.filter);
  const [search, setSearch] = useState(initial.search);
  const [paused, setPaused] = useState(initial.paused);
  const [nflStandingsView, setNflStandingsView] = useState<NflStandingsView>(
    initial.nflStandingsView,
  );
  const [standingsConferenceId, setStandingsConferenceId] = useState(
    initial.standingsConferenceId,
  );
  const [sleeperUsername, setSleeperUsername] = useState(
    initial.sleeperUsername,
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
      sleeperUsername,
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
    sleeperUsername,
  ]);

  // Only college football has polls; other leagues fall back to standings.
  const panelView =
    !hasRankings(division) && selectedPanelView === "rankings"
      ? "standings"
      : selectedPanelView;

  const league = leagueOf(division);

  const setDivision = (next: Division) => {
    // FBS and FCS share the college calendar; other leagues' weeks mean
    // something else.
    if (leagueOf(next) !== league) {
      setWeek(null);
    }
    // Team ids only mean something within one division.
    if (next !== division) {
      setSelectedTeam(undefined);
    }
    if (leagueOf(next) === "ncaaf") {
      setCollegeDivision(next);
    }
    setDivisionState(next);
  };

  // Switches masthead tabs; college football returns to its last division.
  const setLeague = (next: League) => {
    if (next !== league) {
      setDivision(next === "ncaaf" ? collegeDivision : next);
    }
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
    league,
    setLeague,
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
    sleeperUsername,
    setSleeperUsername,
    selectedTeam,
    selectTeam,
    favoriteIds: favorites.ids,
    toggleFavorite: favorites.toggle,
  };
};

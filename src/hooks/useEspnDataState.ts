import { useMemo, useState } from "react";
import { useAppData } from "../context/appDataContext";
import type {
  LeagueSource,
  ScoreboardSource,
  LeagueTable,
  LeagueRow,
  TeamScheduleSource,
} from "../data/types";
import { useTeamSchedule } from "./useTeamSchedule";
import { useScoreboard } from "./useScoreboard";
import { useLeagueTables, type LeagueView } from "./useLeagueTables";

type EspnSources = {
  source: ScoreboardSource;
  leagueSource: LeagueSource;
  scheduleSource: TeamScheduleSource;
};
export const useEspnDataState = ({
  source,
  leagueSource,
  scheduleSource,
}: EspnSources) => {
  const { date, division, paused, panelOpen, filter, search, favoriteIds } =
    useAppData();
  const scoreboard = useScoreboard(source, { date, division }, paused);
  const { games } = scoreboard;
  const [selectedView, setView] = useState<LeagueView>("standings");
  const view =
    division === "nfl" && selectedView === "rankings"
      ? "standings"
      : selectedView;
  const [selectedId, setSelectedId] = useState("");
  const [scheduleConferenceId, setScheduleConferenceId] = useState("");
  const tableView = view === "rankings" ? "rankings" : "standings";
  const league = useLeagueTables(leagueSource, division, tableView, panelOpen);
  const schedule = useTeamSchedule(
    scheduleSource,
    division,
    panelOpen && view === "schedule",
  );
  const selectTeam = (team: LeagueRow) => {
    schedule.selectTeam(team);
    setScheduleConferenceId("");
    setView("schedule");
  };
  const scheduleConferences = tableView === "standings" ? league.tables : [];
  const scheduleConference: LeagueTable | undefined =
    scheduleConferences.find((table) => table.id === scheduleConferenceId) ??
    scheduleConferences.find((table) =>
      table.rows.some((row) => row.id === schedule.selectedTeam?.id),
    );
  const selected: LeagueTable | undefined =
    league.tables.find((table) => table.id === selectedId) ??
    league.tables.at(0);
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
    games: scoreboard.games,
    loading: scoreboard.loading,
    error: scoreboard.error,
    updatedAt: scoreboard.updatedAt,
    refresh: scoreboard.refresh,
    counts,
    visibleGames,
    schedule: {
      ...schedule,
      selectTeam,
      conferences: scheduleConferences,
      conference: scheduleConference,
      setConferenceId: setScheduleConferenceId,
    },
    league: {
      tables: league.tables,
      loading: league.loading,
      error: league.error,
      refresh: league.refresh,
      view,
      setView,
      selected,
      selectedId,
      setSelectedId,
    },
  };
};

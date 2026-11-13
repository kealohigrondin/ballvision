import { useMemo, useState } from "react";

import { useAppData } from "../context/appDataContext";
import type {
  LeagueRow,
  LeagueSource,
  LeagueTable,
  ScoreboardSource,
  TeamScheduleSource,
} from "../data/types";
import { type LeagueView, useLeagueTables } from "./useLeagueTables";
import { useScoreboard } from "./useScoreboard";
import { useSeasonCalendar } from "./useSeasonCalendar";
import { useTeamSchedule } from "./useTeamSchedule";

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
  const {
    week,
    division,
    paused,
    panelOpen,
    filter,
    search,
    favoriteIds,
    nflStandingsView,
    standingsConferenceId,
    setStandingsConferenceId,
  } = useAppData();
  const scoreboard = useScoreboard(source, { division, week }, paused);
  const calendar = useSeasonCalendar(source, division);
  const { games } = scoreboard;
  const [selectedView, setView] = useState<LeagueView>("standings");
  const view =
    division === "nfl" && selectedView === "rankings"
      ? "standings"
      : selectedView;
  const [pollId, setPollId] = useState("");
  const tableView = view === "rankings" ? "rankings" : "standings";
  const league = useLeagueTables(leagueSource, division, tableView, panelOpen);
  const schedule = useTeamSchedule(
    scheduleSource,
    division,
    panelOpen && view === "schedule",
  );

  const selectTeam = (team: LeagueRow) => {
    schedule.selectTeam(team);
    setView("schedule");
  };

  // Every team in the league, sorted by name. NFL standings list each team
  // once per view, so duplicates are dropped.
  const scheduleTeams = useMemo(() => {
    if (tableView !== "standings") {
      return [];
    }
    const teams = new Map<string, LeagueRow>();
    league.tables
      .flatMap((table) => table.rows)
      .forEach((row) => {
        if (!teams.has(row.id)) {
          teams.set(row.id, row);
        }
      });

    return [...teams.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [tableView, league.tables]);

  // Standings keep their conference in app data; polls stay local.
  const selectedId = tableView === "standings" ? standingsConferenceId : pollId;
  const setSelectedId =
    tableView === "standings" ? setStandingsConferenceId : setPollId;

  const selected: LeagueTable | undefined =
    league.tables.find((table) => table.id === selectedId) ??
    league.tables.at(0);

  // NFL standings show every table in the chosen view; college shows one.
  const visibleTables = useMemo(() => {
    if (division === "nfl") {
      return league.tables.filter(
        (table) => table.nflView === nflStandingsView,
      );
    }

    return selected ? [selected] : [];
  }, [division, league.tables, nflStandingsView, selected]);

  const gameCounts = useMemo(
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
    weeks: calendar.weeks,
    currentWeekId: calendar.currentWeekId,
    counts: gameCounts,
    visibleGames,
    schedule: {
      ...schedule,
      selectTeam,
      teams: scheduleTeams,
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
      visibleTables,
    },
  };
};

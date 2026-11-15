import { useMemo, useState } from "react";

import type { Division, NflStandingsView, PanelView } from "@/shared/types";

import type { LeagueRow, LeagueSource, LeagueTable } from "./types";
import { useLeagueTables } from "./useLeagueTables";

export type StandingsOptions = {
  division: Division;
  panelView: PanelView;
  panelOpen: boolean;
  nflStandingsView: NflStandingsView;
  standingsConferenceId: string;
  setStandingsConferenceId: (id: string) => void;
};

// League tables (conference standings or Top 25 polls) for the league panel,
// with the conference or poll the panel shows.
export const useStandingsState = (
  source: LeagueSource,
  {
    division,
    panelView,
    panelOpen,
    nflStandingsView,
    standingsConferenceId,
    setStandingsConferenceId,
  }: StandingsOptions,
) => {
  const view = panelView === "rankings" ? "rankings" : "standings";
  const league = useLeagueTables(source, division, view, panelOpen);
  const [pollId, setPollId] = useState("");

  // Every team in the league, sorted by name. NFL standings list each team
  // once per view, so duplicates are dropped.
  const teams = useMemo(() => {
    if (view !== "standings") {
      return [];
    }
    const unique = new Map<string, LeagueRow>();
    league.tables
      .flatMap((table) => table.rows)
      .forEach((row) => {
        if (!unique.has(row.id)) {
          unique.set(row.id, row);
        }
      });

    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [view, league.tables]);

  // Standings keep their conference in app data; polls stay local.
  const selectedId = view === "standings" ? standingsConferenceId : pollId;
  const setSelectedId =
    view === "standings" ? setStandingsConferenceId : setPollId;

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

  return {
    tables: league.tables,
    loading: league.loading,
    error: league.error,
    refresh: league.refresh,
    view,
    selected,
    selectedId,
    setSelectedId,
    visibleTables,
    teams,
  };
};

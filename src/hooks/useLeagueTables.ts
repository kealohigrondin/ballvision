import { useEffect, useState } from "react";

import type { Division, LeagueSource, LeagueTable } from "../data/types";
export type LeagueView = "standings" | "rankings" | "schedule";

export const useLeagueTables = (
  source: LeagueSource,
  division: Division,
  view: Exclude<LeagueView, "schedule">,
  enabled = true,
) => {
  const key = `${division}:${view}`;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    tables: LeagueTable[];
    loading: boolean;
    error: boolean;
  }>({ key, tables: [], loading: true, error: false });
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let active: AbortController | undefined;

    const load = async () => {
      if (active || disposed) return;
      const controller = new AbortController();
      active = controller;
      const timeout = setTimeout(() => controller.abort(), 15_000);
      setState((previous) => ({
        key,
        tables: previous.key === key ? previous.tables : [],
        loading: true,
        error: false,
      }));
      try {
        const tables =
          view === "standings"
            ? await source.loadStandings(division, controller.signal)
            : await source.loadRankings(division, controller.signal);
        if (!disposed) setState({ key, tables, loading: false, error: false });
      } catch {
        if (!disposed)
          setState((previous) => ({
            ...previous,
            loading: false,
            error: true,
          }));
      } finally {
        clearTimeout(timeout);
        active = undefined;
      }
    };
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 300_000);
    return () => {
      disposed = true;
      clearInterval(timer);
      active?.abort();
    };
  }, [source, division, view, revision, enabled]);
  const current =
    state.key === key ? state : { tables: [], loading: true, error: false };
  return { ...current, refresh: () => setRevision((r) => r + 1) };
};

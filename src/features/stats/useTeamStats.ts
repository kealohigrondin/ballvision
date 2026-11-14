import { useCallback, useEffect, useState } from "react";

import type { Division } from "@/shared/types";

import type { TeamStats, TeamStatsSource } from "./types";

const REFRESH_INTERVAL = 300_000;

// Loads one team's season statistics and refreshes them every five minutes
// while enabled. Changing team or division clears the previous team's stats.
export const useTeamStats = (
  source: TeamStatsSource,
  division: Division,
  teamId: string,
  enabled: boolean,
) => {
  const key = `${division}:${teamId}`;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    data?: TeamStats;
    loading: boolean;
    error: boolean;
  }>({ key, loading: false, error: false });

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!enabled || !teamId) {
      return;
    }
    let disposed = false;
    let request: AbortController | undefined;

    const load = async () => {
      if (disposed || request) {
        return;
      }
      const controller = new AbortController();
      request = controller;
      const timeout = setTimeout(() => controller.abort(), 15_000);
      setState((previous) => ({
        key,
        data: previous.key === key ? previous.data : undefined,
        loading: true,
        error: false,
      }));

      try {
        const data = await source.load({ division, teamId }, controller.signal);
        if (!disposed) {
          setState({ key, data, loading: false, error: false });
        }
      } catch {
        if (!disposed) {
          setState((previous) => ({
            key,
            data: previous.key === key ? previous.data : undefined,
            loading: false,
            error: true,
          }));
        }
      } finally {
        clearTimeout(timeout);
        request = undefined;
      }
    };
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) {
        void load();
      }
    }, REFRESH_INTERVAL);

    return () => {
      disposed = true;
      clearInterval(timer);
      request?.abort();
    };
  }, [source, division, teamId, enabled, revision, key]);

  const current =
    state.key === key
      ? state
      : { data: undefined, loading: Boolean(enabled && teamId), error: false };

  return {
    data: current.data,
    loading: current.loading,
    error: current.error,
    refresh,
  };
};

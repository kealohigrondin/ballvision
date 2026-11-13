import { useCallback, useEffect, useState } from "react";

import type { FantasyLeague, FantasySource } from "../data/types";

// Sleeper's servers cache matchup points for a minute.
const REFRESH_MS = 60_000;

type FantasyState = {
  key: string;
  leagues: FantasyLeague[];
  loading: boolean;
  error: boolean;
};

/** Polls a user's fantasy rosters and points; an empty username loads nothing. */
export const useFantasyRosters = (
  source: FantasySource,
  username: string,
  season: number,
  week: number,
  paused: boolean,
) => {
  const enabled = Boolean(username) && week > 0;
  const key = enabled ? `${username}:${season}:${week}` : "";
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const [state, setState] = useState<FantasyState>({
    key,
    leagues: [],
    loading: false,
    error: false,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let disposed = false;
    let request: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = async () => {
      if (disposed || request || document.hidden) {
        return;
      }
      const controller = new AbortController();
      request = controller;
      setState((current) => ({
        key,
        leagues: current.key === key ? current.leagues : [],
        loading: true,
        error: false,
      }));

      try {
        const leagues = await source.load(
          { username, season, week },
          controller.signal,
        );
        if (!disposed) {
          setState({ key, leagues, loading: false, error: false });
        }
      } catch {
        if (!disposed) {
          setState((current) => ({ ...current, loading: false, error: true }));
        }
      } finally {
        request = undefined;
        if (!disposed && !paused && !document.hidden) {
          timer = setTimeout(update, REFRESH_MS);
        }
      }
    };

    const visibility = () => {
      clearTimeout(timer);
      if (document.hidden) {
        request?.abort();
      } else if (!paused) {
        void update();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    void update();

    return () => {
      disposed = true;
      clearTimeout(timer);
      request?.abort();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [source, enabled, key, username, season, week, paused, revision]);

  const current =
    enabled && state.key === key
      ? state
      : { leagues: [], loading: enabled, error: false };

  return {
    leagues: current.leagues,
    loading: current.loading,
    error: current.error,
    refresh,
  };
};

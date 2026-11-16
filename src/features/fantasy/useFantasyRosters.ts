import { useCallback, useEffect, useState } from "react";

import type { FantasyLeague } from "./types";

// Sleeper's and ESPN's servers cache fantasy points for about a minute.
const REFRESH_MS = 60_000;

type FantasyState = {
  key: string;
  leagues: FantasyLeague[];
  loading: boolean;
  error: boolean;
};

/**
 * Polls a user's fantasy rosters and points. `key` names what `load` fetches
 * and changes whenever it does; an empty key loads nothing. `load` must keep
 * its identity while the key stays the same.
 */
export const useFantasyRosters = (
  load: (signal: AbortSignal) => Promise<FantasyLeague[]>,
  key: string,
  paused: boolean,
) => {
  const enabled = key !== "";
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
        const leagues = await load(controller.signal);
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
  }, [load, enabled, key, paused, revision]);

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

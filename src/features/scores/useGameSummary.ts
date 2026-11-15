import { useCallback, useEffect, useState } from "react";

import type { GameSummary, GameSummaryQuery, GameSummarySource } from "./types";

// Live box scores update with each play; ESPN caches them briefly.
const LIVE_REFRESH_MS = 30_000;

const emptySummary: GameSummary = {
  leaders: { away: [], home: [] },
  stats: [],
};

type SummaryState = {
  key: string;
  summary: GameSummary;
  loading: boolean;
  error: boolean;
};

/**
 * Loads one game's summary, refreshing it while the game is live and
 * auto-refresh is on. An undefined query loads nothing.
 */
export const useGameSummary = (
  source: GameSummarySource,
  query: GameSummaryQuery | undefined,
  live: boolean,
  paused: boolean,
) => {
  const key = query
    ? `${query.division}:${query.gameId}:${query.awayId}:${query.homeId}`
    : "";
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const [state, setState] = useState<SummaryState>({
    key,
    summary: emptySummary,
    loading: false,
    error: false,
  });
  const {
    division = "fbs",
    gameId = "",
    awayId = "",
    homeId = "",
  } = query ?? {};

  useEffect(() => {
    if (!key) {
      return;
    }
    let disposed = false;
    let request: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = async () => {
      if (disposed || request) {
        return;
      }
      const controller = new AbortController();
      request = controller;
      setState((current) => ({
        key,
        summary: current.key === key ? current.summary : emptySummary,
        loading: true,
        error: false,
      }));

      try {
        const summary = await source.load(
          { division, gameId, awayId, homeId },
          controller.signal,
        );
        if (!disposed) {
          setState({ key, summary, loading: false, error: false });
        }
      } catch {
        if (!disposed) {
          setState((current) => ({ ...current, loading: false, error: true }));
        }
      } finally {
        request = undefined;
        if (!disposed && live && !paused) {
          timer = setTimeout(update, LIVE_REFRESH_MS);
        }
      }
    };
    void update();

    return () => {
      disposed = true;
      clearTimeout(timer);
      request?.abort();
    };
  }, [source, key, division, gameId, awayId, homeId, live, paused, revision]);

  const current =
    key && state.key === key
      ? state
      : { summary: emptySummary, loading: Boolean(key), error: false };

  return {
    summary: current.summary,
    loading: current.loading,
    error: current.error,
    refresh,
  };
};

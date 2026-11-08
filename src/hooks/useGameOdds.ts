import { useCallback, useEffect, useRef, useState } from "react";
import type { GameOddsMap, OddsQuery, OddsSource } from "../data/types";

export const useGameOdds = (
  source: OddsSource,
  query: OddsQuery,
  paused: boolean,
) => {
  const queryRef = useRef(query);
  queryRef.current = query;
  const key = `${query.division}:${query.games
    .filter((g) => g.state === "live" || g.state === "upcoming")
    .map((g) => `${g.id}:${g.start}`)
    .sort()
    .join(",")}`;
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const [state, setState] = useState<{
    key: string;
    quotes: GameOddsMap;
    loading: boolean;
    error: boolean;
  }>({ key, quotes: {}, loading: false, error: false });
  useEffect(() => {
    let disposed = false;
    let request: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const update = async () => {
      if (disposed || request || document.hidden) return;
      const controller = new AbortController();
      request = controller;
      const timeout = setTimeout(() => controller.abort(), 15_000);
      setState((current) => ({
        key,
        quotes: current.key === key ? current.quotes : {},
        loading: true,
        error: false,
      }));
      try {
        const quotes = await source.load(queryRef.current, controller.signal);
        if (!disposed) setState({ key, quotes, loading: false, error: false });
      } catch {
        if (!disposed)
          setState((current) => ({ ...current, loading: false, error: true }));
      } finally {
        clearTimeout(timeout);
        request = undefined;
        if (!disposed && !paused && !document.hidden)
          timer = setTimeout(update, 20_000);
      }
    };

    const visibility = () => {
      clearTimeout(timer);
      if (document.hidden) request?.abort();
      else if (!paused) void update();
    };
    document.addEventListener("visibilitychange", visibility);
    void update();
    return () => {
      disposed = true;
      clearTimeout(timer);
      request?.abort();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [source, key, paused, revision]);
  const current: { quotes: GameOddsMap; loading: boolean; error: boolean } =
    state.key === key ? state : { quotes: {}, loading: true, error: false };
  return {
    quotes: current.quotes,
    loading: current.loading,
    error: current.error,
    refresh,
  };
};

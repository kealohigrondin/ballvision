import { useCallback, useEffect, useState } from "react";
import type {
  OddsHistory,
  OddsHistoryQuery,
  OddsHistorySource,
} from "../data/types";

export const useOddsHistory = (
  source: OddsHistorySource,
  query: OddsHistoryQuery | undefined,
  paused: boolean,
  enabled = true,
) => {
  const { awayTokenId = "", homeTokenId = "", range = "1h" } = query ?? {};
  const key = `${awayTokenId}:${homeTokenId}:${range}`;
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  const [state, setState] = useState<{
    key: string;
    data?: OddsHistory;
    loading: boolean;
    error: boolean;
  }>({ key, loading: true, error: false });
  useEffect(() => {
    if (!enabled || !query) return;
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
        data: current.key === key ? current.data : undefined,
        loading: true,
        error: false,
      }));
      try {
        const data = await source.load(
          { awayTokenId, homeTokenId, range },
          controller.signal,
        );
        if (!disposed) setState({ key, data, loading: false, error: false });
      } catch {
        if (!disposed)
          setState((current) => ({ ...current, loading: false, error: true }));
      } finally {
        clearTimeout(timeout);
        request = undefined;
        if (!disposed && !paused && !document.hidden)
          timer = setTimeout(update, 30_000);
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
  }, [source, key, awayTokenId, homeTokenId, range, paused, revision, enabled]);
  const current =
    state.key === key
      ? state
      : { data: undefined, loading: true, error: false };
  return {
    data: current.data,
    loading: enabled && query !== undefined && current.loading,
    error: current.error,
    refresh,
  };
};

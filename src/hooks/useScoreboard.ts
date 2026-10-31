import { useCallback, useEffect, useState } from 'react';
import type { Game, ScoreboardQuery, ScoreboardSource } from '../data/types';

const INTERVAL = 20_000;
export function useScoreboard(source: ScoreboardSource, query: ScoreboardQuery, paused: boolean) {
  const queryKey = `${query.division}:${query.date}`;
  const [state, setState] = useState<{ key: string; games: Game[]; loading: boolean; error: string | null; updatedAt: Date | null }>({
    key: queryKey, games: [], loading: true, error: null, updatedAt: null,
  });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(r => r + 1), []);
  useEffect(() => {
    let disposed = false, active: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = async () => {
      if (disposed || active) return;
      const request = new AbortController();
      active = request;
      const timeout = setTimeout(() => request.abort(), 15_000);
      setState(s => s.key === queryKey ? { ...s, loading: true } : { key: queryKey, games: [], loading: true, error: null, updatedAt: null });
      try {
        const games = await source.load(query, request.signal);
        if (!disposed) setState({ key: queryKey, games, loading: false, updatedAt: new Date(), error: null });
      } catch {
        if (!disposed) setState(s => ({ ...s, loading: false,
          error: 'Unable to reach ESPN. Scores shown may be out of date.' }));
      } finally {
        clearTimeout(timeout);
        active = undefined;
        if (!disposed && !paused && !document.hidden) timer = setTimeout(update, INTERVAL);
      }
    };
    const visibility = () => {
      clearTimeout(timer);
      if (!document.hidden && !paused) void update();
    };
    document.addEventListener('visibilitychange', visibility);
    void update();
    return () => {
      disposed = true;
      clearTimeout(timer);
      active?.abort();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [source, query.date, query.division, paused, revision]);
  // Clear the previous query immediately: a different day's scores must never
  // appear under a new date while its request is in flight.
  return { ...(state.key === queryKey ? state : { games: [], loading: true, error: null, updatedAt: null }), refresh };
}

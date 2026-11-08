import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "../data/types";
import {
  baselineScores,
  detectScoreChanges,
  CELEBRATION_DURATION_MS,
  type ScoreCelebration,
  type ScoreSnapshot,
} from "../utils/scoreCelebrations";

export const useScoreCelebrations = (
  games: readonly Game[],
  key: string,
  ready: boolean,
  pinnedIds: readonly string[],
) => {
  const tracker = useRef<{
    key: string;
    initialized: boolean;
    scores: Map<string, ScoreSnapshot>;
  }>({ key, initialized: false, scores: new Map() });
  const [queue, setQueue] = useState<ScoreCelebration[]>([]);
  const previewId = useRef(0);
  useEffect(() => {
    if (tracker.current.key !== key) {
      tracker.current = { key, initialized: false, scores: new Map() };
      setQueue([]);
    }
    if (!ready) return;
    if (!tracker.current.initialized) {
      tracker.current = {
        key,
        initialized: true,
        scores: baselineScores(games),
      };
      return;
    }
    const { snapshots, celebrations } = detectScoreChanges(
      tracker.current.scores,
      games,
      key,
    );
    tracker.current.scores = snapshots;
    const pinnedCelebrations = celebrations.filter((event) =>
      pinnedIds.includes(event.game.id),
    );
    if (pinnedCelebrations.length > 0)
      setQueue((current) => [...current, ...pinnedCelebrations]);
  }, [games, key, ready, pinnedIds]);
  useEffect(() => {
    if (queue.some((event) => !pinnedIds.includes(event.game.id))) {
      setQueue((current) =>
        current.filter((event) => pinnedIds.includes(event.game.id)),
      );
    }
  }, [queue, pinnedIds]);
  const dismiss = useCallback(
    () => setQueue((current) => current.slice(1)),
    [],
  );
  const dismissAll = useCallback(() => setQueue([]), []);
  const eligibleQueue = queue.filter((event) =>
    pinnedIds.includes(event.game.id),
  );
  const current = tracker.current.key === key ? eligibleQueue[0] : undefined;
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(dismiss, CELEBRATION_DURATION_MS);
    return () => clearTimeout(timer);
  }, [current?.id, dismiss]);
  const preview = useCallback(() => {
    const pinnedGames = games.filter((game) => pinnedIds.includes(game.id));
    const game =
      pinnedGames.find((game) => game.state === "live") ?? pinnedGames[0];
    if (!game) return;
    previewId.current += 1;
    setQueue((current) => [
      ...current,
      {
        id: `preview:${previewId.current}`,
        game,
        scoringTeamIds: [game.home.id],
        points: 0,
        preview: true,
      },
    ]);
  }, [games, pinnedIds]);
  return {
    current,
    pending: Math.max(0, eligibleQueue.length - 1),
    dismiss,
    dismissAll,
    preview,
    previewAvailable: games.some((game) => pinnedIds.includes(game.id)),
  };
};

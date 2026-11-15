import type { Game } from "@/shared/types";

export const NOTIFICATION_DURATION_MS = 7_000;
export type ScoreNotification = {
  id: string;
  game: Game;
  scoringTeamIds: string[];
  points: number;
  preview: boolean;
};
export type ScoreSnapshot = {
  home?: number;
  away?: number;
  homeHigh?: number;
  awayHigh?: number;
  state: Game["state"];
};

const score = (value: string) => {
  if (!/^\d+$/.test(value)) {
    return undefined;
  }
  const parsed = Number(value);

  return Number.isSafeInteger(parsed) ? parsed : undefined;
};

const maximumScore = (before?: number, current?: number) => {
  if (before === undefined) {
    return current;
  }
  if (current === undefined) {
    return before;
  }

  return Math.max(before, current);
};

const snapshot = (game: Game): ScoreSnapshot => ({
  home: score(game.home.score),
  away: score(game.away.score),
  homeHigh: score(game.home.score),
  awayHigh: score(game.away.score),
  state: game.state,
});

export const baselineScores = (games: readonly Game[]) =>
  new Map(games.map((game) => [game.id, snapshot(game)]));

export const detectScoreChanges = (
  previous: Map<string, ScoreSnapshot>,
  games: readonly Game[],
  key: string,
) => {
  const next = new Map(previous);
  const notifications: ScoreNotification[] = [];
  for (const game of games) {
    const current = snapshot(game);
    const before = previous.get(game.id);
    if (!before) {
      next.set(game.id, current);
      continue;
    }
    const homeIncreased =
      current.home !== undefined &&
      before.homeHigh !== undefined &&
      current.home > before.homeHigh;
    const awayIncreased =
      current.away !== undefined &&
      before.awayHigh !== undefined &&
      current.away > before.awayHigh;
    next.set(game.id, {
      ...current,
      homeHigh: maximumScore(before.homeHigh, current.home),
      awayHigh: maximumScore(before.awayHigh, current.away),
    });
    const live =
      game.state === "live" ||
      (before.state === "live" && game.state === "final");
    if (!live || (!homeIncreased && !awayIncreased)) {
      continue;
    }
    const scoringTeamIds = [];
    let points = 0;
    if (homeIncreased) {
      scoringTeamIds.push(game.home.id);
      points += (current.home ?? 0) - (before.home ?? 0);
    }
    if (awayIncreased) {
      scoringTeamIds.push(game.away.id);
      points += (current.away ?? 0) - (before.away ?? 0);
    }
    notifications.push({
      id: `${key}:${game.id}:${current.away}:${current.home}`,
      game,
      scoringTeamIds,
      points,
      preview: false,
    });
  }

  return { snapshots: next, notifications };
};

export const notificationHeadline = (event: ScoreNotification) => {
  if (event.preview) {
    return "CHAOS SOUND CHECK";
  }
  if (event.scoringTeamIds.length > 1) {
    return "EVERYBODY'S EATING";
  }
  if (event.points === 6 || event.points === 7) {
    return "TUDDY ALERT";
  }
  if (event.points === 3) {
    return "FIELD GOAL";
  }
  if (event.points === 1) {
    return "EXTRA POINT. EXTRA AURA.";
  }

  return "SCORE GO BRRRR";
};

export const notificationSoundKind = (event: ScoreNotification) => {
  if (event.preview) {
    return "score";
  }
  const tennesseeScored = [event.game.home, event.game.away].some(
    (team) =>
      event.scoringTeamIds.includes(team.id) &&
      (team.name.trim().toLowerCase() === "tennessee" ||
        team.abbreviation.toUpperCase() === "TENN"),
  );
  const seahawksScored = [event.game.home, event.game.away].some(
    (team) =>
      event.scoringTeamIds.includes(team.id) &&
      (team.name.trim().toLowerCase() === "seahawks" ||
        team.abbreviation.toUpperCase() === "SEA"),
  );
  if (tennesseeScored) {
    return "tennessee_td";
  }
  if (seahawksScored) {
    return "seahawks_td";
  }
  const home = score(event.game.home.score);
  const away = score(event.game.away.score);
  if ((home === 6 && away === 7) || (home === 7 && away === 6)) {
    return "sixSeven";
  }
  if (event.scoringTeamIds.length !== 1) {
    return "score";
  }
  if (event.points === 3) {
    return "fieldGoal";
  }
  if (event.points === 1) {
    return "pat";
  }

  return "score";
};

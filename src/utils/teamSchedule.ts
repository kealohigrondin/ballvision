import type { TeamScheduleGame } from "../data/types";
import { gameTime, kickoff } from "./gameTime";

export const scheduleGameStatus = (game: TeamScheduleGame, teamId: string, timeOnly: boolean = false) => {
  const own = game.home.id === teamId ? game.home : game.away;
  const opponent = game.home.id === teamId ? game.away : game.home;
  const score = `${own.score}–${opponent.score}`;
  if (game.state === "final") {
    const ownScore = Number(own.score);
    const otherScore = Number(opponent.score);
    if (!Number.isFinite(ownScore) || !Number.isFinite(otherScore)) {
      return game.status;
    }
    if (ownScore === otherScore) {
      return `T ${score}`;
    }

    return `${ownScore > otherScore ? "W" : "L"} ${score}`;
  }
  if (game.state === "live") {
    return `${gameTime(game)} · ${score}`;
  }
  if (game.state === "upcoming") {
    return game.timeConfirmed ? kickoff(game.start, timeOnly) : "Time TBD";
  }

  return game.status;
};

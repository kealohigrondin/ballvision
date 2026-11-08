import type { Game } from "../data/types";

export const periodLabel = (period: number) =>
  period > 4 ? `${period - 4}OT` : `Q${period}`;

export const gameTime = (game: Game) => {
  if (game.state !== "live") {
    return game.status;
  }
  if (/half|delay|suspend|end/i.test(game.status)) {
    return game.status;
  }
  if (game.period > 4) {
    return game.period === 5 ? "OVERTIME" : `${game.period - 4}OT`;
  }

  return `Q${game.period} · ${game.clock || "—"}`;
};

export const kickoff = (start: string) => {
  const date = new Date(start);

  return Number.isNaN(date.getTime())
    ? "Time TBD"
    : new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(date);
};

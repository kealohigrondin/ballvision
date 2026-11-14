import type { Game } from "./types";

export const periodLabel = (period: number) =>
  period > 4 ? `${period - 4}OT` : `Q${period}`;

export const gameTime = (game: Game) => {
  if (game.state !== "live") {
    return (
      game.status.toUpperCase() +
      " " +
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date(game.start))
    );
  }
  if (/half|delay|suspend|end/i.test(game.status)) {
    return game.status;
  }
  if (game.period > 4) {
    return game.period === 5 ? "OVERTIME" : `${game.period - 4}OT`;
  }

  return `Q${game.period} · ${game.clock || "—"}`;
};

export const kickoff = (start: string, timeOnly: boolean = false) => {
  const date = new Date(start);

  return Number.isNaN(date.getTime())
    ? "Time TBD"
    : new Intl.DateTimeFormat(undefined, {
        weekday: timeOnly ? undefined : "short", // Fri
        month: timeOnly ? undefined : "short", // Nov
        day: timeOnly ? undefined : "numeric", // 12
        hour: "numeric", // 4
        minute: "2-digit", // 30
        hour12: true, // PM
      }).format(date);
};

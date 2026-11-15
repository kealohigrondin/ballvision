import type { Game, Sport } from "./types";

const soccerPeriods = ["1H", "2H", "ET", "ET", "PENS"];

/** "Q3" or "2OT" in football; "1H", "2H", "ET" or "PENS" in soccer. */
export const periodLabel = (period: number, sport?: Sport) => {
  if (sport === "soccer") {
    return soccerPeriods[period - 1] ?? "";
  }

  return period > 4 ? `${period - 4}OT` : `Q${period}`;
};

// A live soccer match shows ESPN's minute ("67'", "90'+3'"), or its status
// at breaks ("HT") and in shootouts.
const soccerClock = (game: Game) =>
  /\bHT\b|half|break|pen|delay|suspend/i.test(game.status)
    ? game.status
    : game.clock || game.status;

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
  if (game.sport === "soccer") {
    return soccerClock(game);
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

import type { TeamScheduleGame } from "@/features/schedule/types";

import { oddsGame } from "./oddsFixture";
export const scheduleGame: TeamScheduleGame = {
  ...oddsGame,
  id: "schedule-game",
  state: "final",
  start: "2026-09-05T19:00:00Z",
  home: {
    ...oddsGame.home,
    id: "1",
    name: "Georgia",
    abbreviation: "UGA",
    score: "35",
  },
  away: {
    ...oddsGame.away,
    id: "8",
    name: "Clemson",
    abbreviation: "CLEM",
    score: "14",
  },
  timeConfirmed: true,
  neutralSite: false,
};
export const rawScheduleEvent = {
  id: "game",
  date: "2026-09-05T19:00:00Z",
  timeValid: true,
  competitions: [
    {
      neutralSite: true,
      status: {
        type: { completed: true, state: "post", detail: "Final" },
        period: 4,
        displayClock: "0:00",
      },
      broadcasts: [{ media: { shortName: "ABC" } }],
      competitors: [
        {
          id: "1",
          homeAway: "home",
          team: {
            shortDisplayName: "Georgia",
            logos: [
              { href: "https://a.espncdn.com/i/teamlogos/ncaa/500/61.png" },
            ],
          },
          score: { value: 35, displayValue: "35" },
        },
        {
          id: "8",
          homeAway: "away",
          team: { shortDisplayName: "Clemson" },
          score: { value: 14, displayValue: "14" },
        },
      ],
    },
  ],
};

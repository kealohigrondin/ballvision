import type { GameOdds } from "@/features/odds/types";
import type { Game } from "@/shared/types";
export const oddsGame: Game = {
  id: "game-1",
  state: "live",
  start: "2026-11-07T20:30:00Z",
  away: {
    id: "away",
    name: "Penn St",
    location: "Penn State",
    abbreviation: "PSU",
    color: "#123456",
    score: "7",
    quarters: [],
  },
  home: {
    id: "home",
    name: "Washington",
    abbreviation: "WASH",
    color: "#123456",
    score: "0",
    quarters: [],
  },
  clock: "10:00",
  period: 1,
  status: "In progress",
  broadcast: "ABC",
  venue: "",
  situation: "",
  lastPlay: "",
  redZone: false,
};

export const oddsQuote: GameOdds = {
  source: "Polymarket",
  url: "https://polymarket.com/event/cfb-psu-wash-2026-11-07",
  awayTokenId: "222",
  homeTokenId: "111",
  awayProbability: 0.75,
  homeProbability: 0.25,
  updatedAt: Date.now(),
};

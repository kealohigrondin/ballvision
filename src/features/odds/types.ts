import type { Division, Game } from "@/shared/types";

export interface GameOdds {
  source: "Polymarket";
  url: string;
  awayTokenId: string;
  homeTokenId: string;
  awayProbability: number;
  homeProbability: number;
  updatedAt: number;
}
export type GameOddsMap = Record<string, GameOdds>;
export interface OddsQuery {
  division: Division;
  games: readonly Game[];
}
export interface OddsSource {
  load(query: OddsQuery, signal: AbortSignal): Promise<GameOddsMap>;
}

export type OddsHistoryRange = "1h" | "6h" | "1d";
export interface OddsHistoryPoint {
  timestamp: number;
  probability: number;
}
export interface OddsHistory {
  away: OddsHistoryPoint[];
  home: OddsHistoryPoint[];
}
export interface OddsHistoryQuery {
  awayTokenId: string;
  homeTokenId: string;
  range: OddsHistoryRange;
}
export interface OddsHistorySource {
  load(query: OddsHistoryQuery, signal: AbortSignal): Promise<OddsHistory>;
}

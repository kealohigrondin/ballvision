export interface FantasyPlayer {
  id: string;
  name: string;
  position: string;
  /** NFL team, using ESPN's abbreviation. */
  team: string;
  points: number;
  starter: boolean;
}
export interface FantasyLeague {
  id: string;
  name: string;
  players: FantasyPlayer[];
}
export interface FantasyQuery {
  username: string;
  season: number;
  week: number;
}
export interface FantasySource {
  load(query: FantasyQuery, signal: AbortSignal): Promise<FantasyLeague[]>;
}

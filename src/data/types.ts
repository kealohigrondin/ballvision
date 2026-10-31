export type Division = 'fbs' | 'fcs';
export type GameState = 'live' | 'upcoming' | 'final' | 'other';
export interface Team {
  id: string; name: string; abbreviation: string; logo?: string;
  color: string; score: string; rank?: number; record?: string;
  conferenceId?: string; quarters: string[];
}
export interface Game {
  id: string; home: Team; away: Team; state: GameState;
  status: string; clock: string; period: number; start: string;
  broadcast: string; venue: string; possession?: string;
  situation: string; lastPlay: string; redZone: boolean;
  homeTimeouts?: number; awayTimeouts?: number;
}
export interface ScoreboardQuery { date: string; division: Division }
export interface ScoreboardSource {
  load(query: ScoreboardQuery, signal: AbortSignal): Promise<Game[]>;
}

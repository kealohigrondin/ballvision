import type { Division, Game } from "@/shared/types";

export interface TeamScheduleGame extends Game {
  timeConfirmed: boolean;
  neutralSite: boolean;
}
export interface TeamSchedule {
  season: string;
  games: TeamScheduleGame[];
}
export interface TeamScheduleSource {
  load(
    query: { division: Division; teamId: string },
    signal: AbortSignal,
  ): Promise<TeamSchedule>;
}

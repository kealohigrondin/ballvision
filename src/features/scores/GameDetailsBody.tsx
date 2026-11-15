import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { copy } from "@/copy";
import type { Game } from "@/shared/types";

import { GameLeaders } from "./GameLeaders";
import { GameLeadersSkeleton } from "./GameLeadersSkeleton";
import { useGameSummaryData } from "./gameSummaryContext";
import { ScoringPlays } from "./ScoringPlays";
import { ScoringPlaysSkeleton } from "./ScoringPlaysSkeleton";
import { TeamStats } from "./TeamStats";
import { TeamStatsSkeleton } from "./TeamStatsSkeleton";

type GameDetailsBodyProps = {
  game: Game;
  /** Shown for unfinished games, after the team stats. */
  liveDetails?: ReactNode;
  /** Shown after the last play, above the scoring summary. */
  playerDetails?: ReactNode;
};

// Everything known about one game below its header: last play, extra
// player details, the scoring summary, each team's leaders, team stats, live
// extras, timeouts and venue.
export const GameDetailsBody = ({
  game,
  liveDetails,
  playerDetails,
}: GameDetailsBodyProps) => {
  const isFinal = game.state === "final";
  const hasTimeouts =
    game.state === "live" &&
    (game.homeTimeouts !== undefined || game.awayTimeouts !== undefined);
  const { summary, loading, error } = useGameSummaryData();
  const hasLeaders =
    summary.leaders.away.length > 0 || summary.leaders.home.length > 0;
  const hasStats = summary.stats.length > 0;
  const hasScoring = summary.scoringPlays.length > 0;
  // A loaded summary always has box score stats once a game starts, so a
  // game with stats but no scores shows "no scoring yet". Live refreshes keep
  // the section on screen instead of flashing the placeholder.
  const showScoring = hasScoring || hasStats;
  const hasDetails = Boolean(
    hasLeaders ||
    hasStats ||
    hasScoring ||
    game.lastPlay ||
    game.home.quarters.length ||
    game.away.quarters.length ||
    game.venue ||
    hasTimeouts,
  );

  return (
    <Stack spacing={2}>
      {game.lastPlay && (
        <Typography component="div" id={`game-last-play-${game.id}`}>
          <Typography
            component="span"
            sx={{ display: "block", fontWeight: 600 }}
          >
            {copy.gameDetails.lastPlay}
          </Typography>
          {game.lastPlay}
        </Typography>
      )}
      {playerDetails}
      {/* Placeholders hold each section's space on the first load; live
          refreshes keep the current data on screen. */}
      {loading && !showScoring && <ScoringPlaysSkeleton gameId={game.id} />}
      {showScoring && (
        <ScoringPlays
          gameId={game.id}
          away={game.away}
          home={game.home}
          plays={summary.scoringPlays}
        />
      )}
      {loading && !hasLeaders && <GameLeadersSkeleton gameId={game.id} />}
      {hasLeaders && (
        <GameLeaders
          gameId={game.id}
          away={game.away}
          home={game.home}
          leaders={summary.leaders}
        />
      )}
      {loading && !hasStats && <TeamStatsSkeleton gameId={game.id} />}
      {hasStats && (
        <TeamStats
          gameId={game.id}
          away={game.away}
          home={game.home}
          stats={summary.stats}
        />
      )}
      {error && !hasLeaders && !hasStats && (
        <Typography variant="body2" color="text.secondary">
          {copy.gameDetails.statsError}
        </Typography>
      )}
      {!isFinal && liveDetails}
      {hasTimeouts && (
        <Typography>
          Timeouts: {game.away.abbreviation} {game.awayTimeouts ?? "—"} ·{" "}
          {game.home.abbreviation} {game.homeTimeouts ?? "—"}
        </Typography>
      )}
      {!isFinal && game.venue && (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <MapPin size={20} />
          <Typography>{game.venue}</Typography>
        </Stack>
      )}
      {!hasDetails && <Typography>{copy.gameDetails.unavailable}</Typography>}
    </Stack>
  );
};

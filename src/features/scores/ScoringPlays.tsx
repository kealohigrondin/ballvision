import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

import { copy } from "@/copy";
import type { Team } from "@/shared/types";

import { scoringPlayGridSx } from "./scoringPlayGrid";
import { ScoringPlayRow } from "./ScoringPlayRow";
import type { ScoringPlay } from "./types";

type ScoringPlaysProps = {
  gameId: string;
  away: Team;
  home: Team;
  plays: ScoringPlay[];
};

// Both teams' scores in one list, in the order they happened, under a
// heading for each quarter with the away and home score columns.
export const ScoringPlays = ({
  gameId,
  away,
  home,
  plays,
}: ScoringPlaysProps) => {
  const periods = useMemo(
    () =>
      plays.reduce<{ period: number; plays: ScoringPlay[] }[]>(
        (groups, play) => {
          const last = groups.at(-1);
          if (last?.period === play.period) {
            last.plays.push(play);

            return groups;
          }

          return [...groups, { period: play.period, plays: [play] }];
        },
        [],
      ),
    [plays],
  );

  const groups = periods.map(({ period, plays: periodPlays }) => (
    <Box component="li" key={period}>
      <Box sx={{ ...scoringPlayGridSx, pb: 0.5 }}>
        <Typography
          component="h4"
          variant="caption"
          color="text.secondary"
          sx={{ gridColumn: "span 2", fontWeight: 600 }}
        >
          {copy.scoringPlays.period(period)}
        </Typography>
        <Typography
          aria-hidden
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "right" }}
        >
          {away.abbreviation}
        </Typography>
        <Typography
          aria-hidden
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "right" }}
        >
          {home.abbreviation}
        </Typography>
      </Box>
      <Stack
        component="ul"
        spacing={1.5}
        sx={{ m: 0, p: 0, listStyle: "none" }}
      >
        {periodPlays.map((play) => (
          <ScoringPlayRow
            key={play.id}
            id={`scoring-play-${gameId}-${play.id}`}
            team={play.side === "away" ? away : home}
            type={play.type}
            clock={play.clock}
            text={play.text}
            awayScore={play.awayScore}
            homeScore={play.homeScore}
            scorer={play.side}
            scoreLabel={copy.scoringPlays.score(
              away.abbreviation,
              play.awayScore,
              home.abbreviation,
              play.homeScore,
            )}
          />
        ))}
      </Stack>
    </Box>
  ));

  return (
    <Stack
      component="section"
      id={`scoring-plays-${gameId}`}
      aria-labelledby={`scoring-plays-title-${gameId}`}
      spacing={1.5}
    >
      <Typography
        id={`scoring-plays-title-${gameId}`}
        component="h3"
        sx={{ fontWeight: 600 }}
      >
        {copy.scoringPlays.title}
      </Typography>
      {plays.length > 0 && (
        <Stack
          component="ul"
          spacing={2}
          sx={{ m: 0, p: 0, listStyle: "none" }}
        >
          {groups}
        </Stack>
      )}
      {plays.length === 0 && (
        <Typography
          id={`scoring-plays-none-${gameId}`}
          variant="body2"
          color="text.secondary"
        >
          {copy.scoringPlays.none}
        </Typography>
      )}
    </Stack>
  );
};

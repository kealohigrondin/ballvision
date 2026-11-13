import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { copy } from "../copy";
import type { TeamScheduleGame } from "../data/types";
import { scheduleGameStatus } from "../utils/teamSchedule";
import { TeamLogo } from "./TeamLogo";
import { TeamScheduleLink } from "./TeamScheduleLink";

type TeamScheduleRowProps = { game: TeamScheduleGame; teamId: string };

export const TeamScheduleRow = ({ game, teamId }: TeamScheduleRowProps) => {
  const home = game.home.id === teamId;
  const opponent = home ? game.away : game.home;
  const prefix =
    !home && !game.neutralSite ? copy.schedule.away : copy.schedule.home;
  const date = new Date(game.start);
  const dateLabel = Number.isNaN(date.getTime())
    ? "TBD"
    : new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        timeZone: game.timeConfirmed ? undefined : "UTC",
      }).format(date);

  return (
    <TableRow>
      <TableCell sx={{ whiteSpace: "nowrap" }}>{dateLabel}</TableCell>
      <TableCell component="th" scope="row">
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", minWidth: 0 }}
        >
          <TeamLogo team={opponent} size={24} />
          <Typography
            component="span"
            variant="body2"
            sx={{ overflowWrap: "anywhere" }}
          >
            {prefix} <TeamScheduleLink team={opponent} abbreviatedName />
          </Typography>
        </Stack>
        {game.neutralSite && (
          <Typography variant="caption" color="text.secondary">
            Neutral site
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {scheduleGameStatus(game, teamId, true)}
        </Typography>
        {Boolean(game.broadcast) && date.getTime() > Date.now() && (
          <Typography variant="caption" color="text.secondary">
            {game.broadcast}
          </Typography>
        )}
      </TableCell>
    </TableRow>
  );
};

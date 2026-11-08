import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import type { Team } from "../data/types";
import { TeamLogo } from "./TeamLogo";
import { TeamScheduleLink } from "./TeamScheduleLink";

type TeamRowProps = {
  team: Team;
  possession: boolean;
  scheduled: boolean;
  periods: readonly number[];
};

export const TeamRow = ({
  team,
  possession,
  scheduled,
  periods,
}: TeamRowProps) => {
  const score = scheduled ? "—" : team.score;
  const record = team.record || team.abbreviation;
  const periodCells = periods.map((period) => (
    <TableCell className="team-period" key={period} align="right">
      {team.quarters[period] ?? ""}
    </TableCell>
  ));

  return (
    <TableRow className="team-row">
      <TableCell component="th" scope="row" className="team-identity-cell">
        <Stack
          direction="row"
          className="team-identity"
          sx={{ alignItems: "center", gap: 1, minWidth: 0, width: "100%" }}
        >
          <Box
            sx={{
              width: "1ch",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {possession && (
              <Typography
                component="span"
                className="possession"
                title="Possession"
                aria-label="Possession"
                sx={{
                  color: "primary.main",
                }}
              >
                ◆
              </Typography>
            )}
          </Box>
          <TeamLogo team={team} size={36} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              component="div"
              className="team-name"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {Boolean(team.rank) && (
                <Typography
                  component="span"
                  className="rank"
                  sx={{
                    color: "text.secondary",
                    mr: 0.5,
                  }}
                >
                  {team.rank}
                </Typography>
              )}
              <TeamScheduleLink team={team} />
            </Typography>
            <Typography
              component="span"
              className="record"
              sx={{
                color: "text.secondary",
                display: "block",
              }}
            >
              {record}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      {periodCells}
      <TableCell className="team-total" align="right">
        <Typography
          variant="body1"
          component="span"
          className="score"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {score}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

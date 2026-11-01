import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import type { Team } from "../data/types";
import { TeamLogo } from "./TeamLogo";

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
    <TableCell className="team-period" key={period}>
      {team.quarters[period] ?? ""}
    </TableCell>
  ));

  return (
    <TableRow
      className="team-row"
      sx={{
        "& .team-logo": { width: "36px", height: "36px", flexShrink: "0" },
      }}
    >
      <TableCell component="th" scope="row" className="team-identity-cell">
        <Stack
          direction="row"
          className="team-identity"
          sx={{ alignItems: "center", gap: "10px", minWidth: "0" }}
        >
          <TeamLogo team={team} />
          <Box className="team-info" sx={{ minWidth: "0" }}>
            <Typography
              variant="body2"
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
                  variant="caption"
                  component="span"
                  className="rank"
                  sx={{
                    color: "var(--mui-app-colors-rank)",
                    marginRight: "4px",
                  }}
                >
                  {team.rank}
                </Typography>
              )}
              &nbsp;
              {team.name}&nbsp;
              {possession && (
                <Typography
                  variant="caption"
                  component="span"
                  className="possession"
                  title="Possession"
                  aria-label="Possession"
                  sx={{
                    color: "var(--mui-palette-primary-main)",
                    marginLeft: "5px",
                  }}
                >
                  ◆
                </Typography>
              )}
            </Typography>
            <Typography
              variant="caption"
              component="span"
              className="record"
              sx={{
                color: "var(--mui-app-colors-record)",
                display: "block",
                marginTop: "2px",
              }}
            >
              {record}
            </Typography>
          </Box>
        </Stack>
      </TableCell>
      {periodCells}
      <TableCell className="team-total">
        <Typography
          variant="h6"
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

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { useEspnData } from "../context/espnDataContext";
import { copy } from "../copy";
import { teamColumnTableSx } from "../styles/leagueTable";
import { TeamLogo } from "./TeamLogo";
import { TeamScheduleRow } from "./TeamScheduleRow";

type TeamScheduleProps = Record<string, never>;

export const TeamSchedule = ({}: TeamScheduleProps) => {
  const {
    schedule: { selectedTeam, data, loading, error, refresh },
  } = useEspnData();

  if (!selectedTeam) {
    return (
      <Typography color="text.secondary">{copy.schedule.prompt}</Typography>
    );
  }

  const rows = data?.games.map((game) => (
    <TeamScheduleRow key={game.id} game={game} teamId={selectedTeam.id} />
  ));

  return (
    <Stack id="team-schedule" spacing={2}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <TeamLogo
          team={{
            ...selectedTeam,
            abbreviation: selectedTeam.abbreviation || selectedTeam.name,
          }}
          size={32}
        />
        <Stack>
          <Typography component="h2" variant="h6">
            {copy.schedule.table(selectedTeam.name)}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {data?.season ?? copy.schedule.currentSeason} ·{" "}
            {selectedTeam.record}
          </Typography>
        </Stack>
      </Stack>

      {loading && !data && (
        <Typography role="status" color="text.secondary">
          {copy.schedule.loading}
        </Typography>
      )}

      {error && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" disabled={loading} onClick={refresh}>
              {copy.common.retry}
            </Button>
          }
        >
          {copy.schedule.error}
        </Alert>
      )}
      {data && data.games.length === 0 && !loading && (
        <Typography color="text.secondary">{copy.schedule.empty}</Typography>
      )}
      {data && data.games.length > 0 && (
        <TableContainer>
          <Table
            size="small"
            aria-label={copy.schedule.table(selectedTeam.name)}
            sx={teamColumnTableSx(2)}
          >
            <TableHead>
              <TableRow>
                <TableCell>DATE</TableCell>
                <TableCell>OPPONENT</TableCell>
                <TableCell align="right">RESULT / TIME</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
};

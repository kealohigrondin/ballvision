import { useEspnData } from "../context/espnDataContext";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { TeamLogo } from "./TeamLogo";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

type LeagueTableProps = Record<string, never>;
export const LeagueTable = ({}: LeagueTableProps) => {
  const {
    league: { selected: table, view },
  } = useEspnData();
  if (!table) return null;
  const ranked = view === "rankings";
  const column = ranked ? "PTS" : "CONF";
  const rows = table.rows.map((row) => {
    const value = ranked ? row.points : row.conferenceRecord;
    return (
      <TableRow key={row.id}>
        <TableCell component="th" scope="row">
          <Stack
            direction="row"
            className="league-team"
            spacing={1}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            {ranked && (
              <Box component="span" className="league-rank">
                {row.rank}
              </Box>
            )}
            <TeamLogo
              team={{ ...row, abbreviation: row.abbreviation || row.name }}
              size={24}
            />
            <Typography
              component="span"
              variant="body2"
              sx={{ overflowWrap: "anywhere" }}
            >
              {row.name}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="right">{value ?? "—"}</TableCell>
        <TableCell align="right">{row.record}</TableCell>
      </TableRow>
    );
  });
  return (
    <TableContainer className="league-table-scroll" sx={{ overflowX: "auto" }}>
      <Table className="league-table">
        <caption>
          {table.title}
          <Typography component="span" sx={{ display: "block" }}>
            {table.subtitle}
          </Typography>
        </caption>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              TEAM
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              {column}
            </TableCell>
            <TableCell component="th" scope="col" align="right">
              OVR
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};

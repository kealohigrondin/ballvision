import { tableCellSx } from "../styles/shared";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { TeamLogo } from "./TeamLogo";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import type { LeagueTable as LeagueTableData } from "../data/types";
import type { LeagueView } from "../hooks/useLeagueTables";

type LeagueTableProps = { table: LeagueTableData; view: LeagueView };

export const LeagueTable = ({ table, view }: LeagueTableProps) => {
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
            sx={{
              alignItems: "center",
              gap: "8px",
              "& .team-logo": { width: "24px", height: "24px" },
              "& .league-rank": { flexShrink: "0", minWidth: "18px" },
              minWidth: "0",
              "& > span:last-child": {
                minWidth: "0",
                overflowWrap: "anywhere",
              },
            }}
          >
            {ranked && (
              <Box
                component="span"
                className="league-rank"
                sx={{
                  display: "inline-block",
                  minWidth: "23px",
                  color: "var(--mui-palette-text-secondary)",
                }}
              >
                {row.rank}
              </Box>
            )}
            <TeamLogo
              team={{ ...row, abbreviation: row.abbreviation || row.name }}
            />
            <span>{row.name}</span>
          </Stack>
        </TableCell>
        <TableCell>{value ?? "—"}</TableCell>
        <TableCell>{row.record}</TableCell>
      </TableRow>
    );
  });
  return (
    <TableContainer className="league-table-scroll" sx={{ overflowX: "auto" }}>
      <Table
        className="league-table"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          "& caption": {
            textAlign: "left",
            color: "var(--mui-palette-text-primary)",
            padding: "8px 0 14px",
          },
          "& caption span": {
            display: "block",
            marginTop: "4px",
            color: "var(--mui-palette-text-secondary)",
          },
          "& th": {
            ...tableCellSx,
            padding: "12px 4px",
          },
          "& td": {
            ...tableCellSx,
            padding: "12px 4px",
            color: "var(--mui-app-colors-tableText)",
            whiteSpace: "nowrap",
          },
          "& th:first-of-type": { textAlign: "left" },
          "& thead th": { color: "var(--mui-palette-text-secondary)" },
          "& th:nth-child(2)": { width: "60px" },
          "& td:nth-child(2)": { width: "60px" },
          "& th:nth-child(3)": { width: "76px" },
          "& td:nth-child(3)": { width: "76px" },
        }}
      >
        <caption>
          {table.title}
          <span>{table.subtitle}</span>
        </caption>
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">
              TEAM
            </TableCell>
            <TableCell component="th" scope="col">
              {column}
            </TableCell>
            <TableCell component="th" scope="col">
              OVR
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
      </Table>
    </TableContainer>
  );
};

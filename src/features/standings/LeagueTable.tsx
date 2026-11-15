import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import clsx from "clsx";
import { type ReactNode, useMemo } from "react";

import { copy } from "@/copy";
import { TeamLogo } from "@/shared/components/TeamLogo";
import { TeamScheduleLink } from "@/shared/components/TeamScheduleLink";

import { leagueTableSx, rankTrendColor } from "./leagueTableStyles";
import { LeagueZoneKey } from "./LeagueZoneKey";
import { rankTrend } from "./rankTrend";
import { useStandingsData } from "./standingsContext";
import type { LeagueRow, LeagueTable as LeagueTableData } from "./types";

type LeagueTableProps = { table: LeagueTableData };

type LeagueColumn = {
  key: string;
  header: string;
  cell: (row: LeagueRow) => ReactNode;
  id?: (row: LeagueRow) => string;
  color?: (row: LeagueRow) => string;
};

const { columns: headers } = copy.league;

const recordColumn: LeagueColumn = {
  key: "record",
  header: headers.overall,
  cell: (row) => row.record,
};

// Soccer tables: played, W-D-L, goal difference and league points.
const soccerColumns: LeagueColumn[] = [
  { key: "played", header: headers.played, cell: (row) => row.played },
  { ...recordColumn, header: headers.winDrawLoss },
  {
    key: "goalDifference",
    header: headers.goalDifference,
    cell: (row) => row.goalDifference,
  },
  { key: "points", header: headers.points, cell: (row) => row.points },
];

// A league table: conference standings, a Top 25 poll or a soccer table.
export const LeagueTable = ({ table }: LeagueTableProps) => {
  const { view } = useStandingsData();
  const ranked = view === "rankings";

  const columns = useMemo((): LeagueColumn[] => {
    if (table.soccer) {
      return soccerColumns;
    }
    // Polls without voting points (the playoff committee) skip that column.
    const showPointsColumn =
      !ranked || table.rows.some((row) => row.points !== undefined);
    const pointsColumn: LeagueColumn = ranked
      ? { key: "points", header: headers.points, cell: (row) => row.points }
      : {
          key: "conference",
          header: headers.conference,
          cell: (row) => row.conferenceRecord,
        };
    const trendColumn: LeagueColumn = {
      key: "trend",
      header: copy.league.trend,
      cell: (row) => rankTrend(row).label,
      id: (row) => `league-trend-${row.id}`,
      color: (row) => rankTrendColor[rankTrend(row).direction],
    };

    return [
      ...(showPointsColumn ? [pointsColumn] : []),
      recordColumn,
      ...(ranked ? [trendColumn] : []),
    ];
  }, [table.soccer, table.rows, ranked]);

  // IDs can't contain spaces, so "AFC East" becomes "afc-east".
  const titleId = table.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const rows = table.rows.map((row) => {
    const divider = clsx(
      row.dividerAfter && "league-row-divider",
      row.dividerAfter === "dashed" && "league-row-divider-dashed",
    );

    return (
      <TableRow key={row.id} className={divider}>
        <TableCell component="th" scope="row" title={row.note}>
          <Stack
            direction="row"
            className="league-team"
            spacing={1}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            {row.rank !== undefined && (
              <Box component="span" className="league-rank">
                {row.rank}
              </Box>
            )}
            <TeamLogo
              team={{ ...row, abbreviation: row.abbreviation || row.name }}
              size={24}
            />
            <TeamScheduleLink team={row} />
          </Stack>
        </TableCell>
        {columns.map((column) => (
          <TableCell
            key={column.key}
            align="right"
            id={column.id?.(row)}
            sx={{ color: column.color?.(row) }}
          >
            {column.cell(row) ?? "—"}
          </TableCell>
        ))}
      </TableRow>
    );
  });

  return (
    <Stack spacing={1}>
      <TableContainer
        id={`league-table-scroll-${titleId}`}
        sx={{ overflowX: "auto" }}
      >
        <Table
          size="small"
          aria-label={`league-table-${table.title}`}
          sx={leagueTableSx}
        >
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col">
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold" }}
                  id={`league-table-title-${titleId}`}
                >
                  {table.title}
                </Typography>
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  component="th"
                  scope="col"
                  align="right"
                >
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </TableContainer>
      {table.zones && table.zones.length > 0 && (
        <LeagueZoneKey id={`league-zones-${titleId}`} zones={table.zones} />
      )}
    </Stack>
  );
};

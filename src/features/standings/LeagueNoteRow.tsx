import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

type LeagueNoteRowProps = {
  id: string;
  note: string;
  /** How many columns the note spans: the whole table width. */
  colSpan: number;
  /** The class that draws the divider under this row, if any. */
  className?: string;
};

// A small full-width row naming what the table positions above it earn,
// e.g. "Champions League", drawn above that zone's divider.
export const LeagueNoteRow = ({
  id,
  note,
  colSpan,
  className = "",
}: LeagueNoteRowProps) => (
  <TableRow id={id} className={className}>
    <TableCell colSpan={colSpan} sx={{ py: 0.25 }}>
      <Typography variant="caption" color="text.secondary">
        {note}
      </Typography>
    </TableCell>
  </TableRow>
);

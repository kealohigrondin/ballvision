import { useEspnData } from "../context/espnDataContext";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";

import { useMemo } from "react";
import { useAppData } from "../context/appDataContext";
import { TeamSchedule } from "./TeamSchedule";
import { LeagueTable } from "./LeagueTable";
import { TeamSchedulePicker } from "./TeamSchedulePicker";
import { copy } from "../copy";

type LeaguePanelProps = Record<string, never>;

export const LeaguePanel = ({}: LeaguePanelProps) => {
  const { division } = useAppData();
  const {
    league: { tables, loading, error, refresh, view, selected, setSelectedId },
  } = useEspnData();
  const options = tables.map((table) => (
    <option key={table.id} value={table.id}>
      {table.title}
    </option>
  ));
  const secondaryLabel = useMemo(() => {
    if (division === "nfl") return copy.league.division;
    return view === "standings" ? copy.league.conference : copy.league.poll;
  }, [division, view]);

  const content = useMemo(() => {
    if (view === "schedule") return <TeamSchedule />;
    if (loading && !selected) {
      return (
        <Typography
          variant="body2"
          component="p"
          className="league-message"
          role="status"
          color="text.secondary"
        >
          {copy.league.loading}
        </Typography>
      );
    }
    if (selected?.rows.length) {
      return <LeagueTable />;
    }
    return (
      <Typography
        variant="body2"
        component="p"
        className="league-message"
        color="text.secondary"
      >
        {copy.league.empty}
      </Typography>
    );
  }, [loading, selected, view]);

  const label = useMemo(() => {
    if (view === "schedule") return "Team schedule";
    if (division === "nfl") return "NFL standings";
    return view === "rankings" ? "Top 25" : "Conference standings";
  }, [division, view]);

  return (
    <Slide in direction="right" appear>
      <Paper
        component="aside"
        sx={{
          gridArea: "panel",
          position: { xs: "static", md: "sticky" },
          top: 16,
          mt: 2,
          p: 2,
          height: { xs: "auto", md: "calc(100dvh - 32px)" },
          maxHeight: { xs: 440, md: "calc(100dvh - 32px)" },
          minWidth: 0,
          overflowY: "auto",
        }}
        className="league-panel"
        id="league-panel"
        aria-label={copy.league.panel}
      >
        {view === "schedule" && <TeamSchedulePicker />}
        {view !== "schedule" && tables.length > 0 && (
          <TextField
            select
            fullWidth
            label={secondaryLabel}
            value={selected?.id ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            slotProps={{ select: { native: true } }}
            sx={{ mb: 2 }}
          >
            {options}
          </TextField>
        )}
        {error && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" onClick={refresh} disabled={loading}>
                {copy.common.retry}
              </Button>
            }
          >
            {copy.league.error}
          </Alert>
        )}
        {content}
        <Typography
          component="p"
          className="league-note"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {label} · {division.toUpperCase()} · Current season. Updates every 5
          minutes; records may lag live games.
        </Typography>
      </Paper>
    </Slide>
  );
};

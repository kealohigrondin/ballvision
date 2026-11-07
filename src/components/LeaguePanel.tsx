import { SegmentedControl } from "./SegmentedControl";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";

import { useMemo, useState } from "react";
import { useAppData } from "../context/appDataContext";
import { useLeagueTables, type LeagueView } from "../hooks/useLeagueTables";
import { LeagueTable } from "./LeagueTable";

type LeaguePanelProps = Record<string, never>;

export const LeaguePanel = ({}: LeaguePanelProps) => {
  const { leagueSource: source, division } = useAppData();
  const [selectedView, setView] = useState<LeagueView>("standings");
  const view = division === "nfl" ? "standings" : selectedView;
  const [selectedId, setSelectedId] = useState("");
  const { tables, loading, error, refresh } = useLeagueTables(
    source,
    division,
    view,
  );
  const selected = tables.find((table) => table.id === selectedId) ?? tables[0];
  const options = tables.map((table) => (
    <option key={table.id} value={table.id}>
      {table.title}
    </option>
  ));
  const secondaryLabel = useMemo(() => {
    if (division === "nfl") return "Division";
    return view === "standings" ? "Conference" : "Poll";
  }, [division, view]);

  const content = useMemo(() => {
    if (loading && !selected) {
      return (
        <Typography
          variant="body2"
          component="p"
          className="league-message"
          role="status"
          color="text.secondary"
        >
          Loading league data…
        </Typography>
      );
    }
    if (selected?.rows.length) {
      return <LeagueTable table={selected} view={view} />;
    }
    return (
      <Typography
        variant="body2"
        component="p"
        className="league-message"
        color="text.secondary"
      >
        No league data is available for this division.
      </Typography>
    );
  }, [loading, selected, view]);

  const label = useMemo(() => {
    if (division === "nfl") return "NFL standings";
    return view === "rankings" ? "Top 25" : "Conference standings";
  }, [division, view]);

  return (
    <Paper
      component="aside"
      sx={{
        position: { xs: "static", md: "sticky" },
        gridRow: { xs: 1, md: "auto" },
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
      aria-label="League information"
    >
      {division !== "nfl" && (
        <SegmentedControl<LeagueView>
          label="League view"
          className="league-view-switch"
          value={view}
          options={[
            { value: "standings", label: "Standings" },
            { value: "rankings", label: "Top 25" },
          ]}
          onChange={(nextView) => {
            setView(nextView);
            setSelectedId("");
          }}
          sx={{ mb: 2 }}
        />
      )}
      {tables.length > 0 && (
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
              Retry
            </Button>
          }
        >
          Unable to update league data. Any displayed records may be out of
          date.
        </Alert>
      )}
      {content}
      <Typography
        variant="caption"
        component="p"
        className="league-note"
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        {label} · {division.toUpperCase()} · Current season. Updates every 5
        minutes; records may lag live games.
      </Typography>
    </Paper>
  );
};

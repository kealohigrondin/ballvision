import { SegmentedControl } from "./SegmentedControl";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import "./styles/LeaguePanel.css";
import { useState } from "react";
import type { Division, LeagueSource } from "../data/types";
import { useLeagueTables, type LeagueView } from "../hooks/useLeagueTables";
import { LeagueTable } from "./LeagueTable";

type LeaguePanelProps = { source: LeagueSource; division: Division };

export const LeaguePanel = ({ source, division }: LeaguePanelProps) => {
  const [view, setView] = useState<LeagueView>("standings");
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
  const secondaryLabel = view === "standings" ? "Conference" : "Poll";
  const secondary = tables.length ? (
    <label className="league-select-label">
      {secondaryLabel}
      <select
        value={selected?.id ?? ""}
        onChange={(e) => setSelectedId(e.target.value)}
      >
        {options}
      </select>
    </label>
  ) : null;

  const warning = error ? (
    <Box className="league-warning" role="alert">
      Unable to update league data. Any displayed records may be out of date.
      <button onClick={refresh} disabled={loading}>
        Retry
      </button>
    </Box>
  ) : null;

  let content = (
    <Typography variant="body2" component="p" className="league-message">
      No league data is available for this division.
    </Typography>
  );

  if (loading && !selected)
    content = (
      <Typography
        variant="body2"
        component="p"
        className="league-message"
        role="status"
      >
        Loading league data…
      </Typography>
    );
  else if (selected?.rows.length)
    content = <LeagueTable table={selected} view={view} />;
  const label = view === "rankings" ? "Top 25" : "Conference standings";

  return (
    <Paper
      component="aside"
      elevation={0}
      sx={{ borderRadius: "24px" }}
      className="league-panel"
      id="league-panel"
      aria-label="League information"
    >
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
      />
      {secondary}
      {warning}
      {content}
      <Typography variant="caption" component="p" className="league-note">
        {label} · {division.toUpperCase()} · Current season. Updates every 5
        minutes; records may lag live games.
      </Typography>
    </Paper>
  );
};

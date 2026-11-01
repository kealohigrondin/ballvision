import { SegmentedControl } from "./SegmentedControl";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import { useMemo, useState } from "react";
import type { Division, LeagueSource } from "../data/types";
import { useLeagueTables, type LeagueView } from "../hooks/useLeagueTables";
import { LeagueTable } from "./LeagueTable";

type LeaguePanelProps = { source: LeagueSource; division: Division };

export const LeaguePanel = ({ source, division }: LeaguePanelProps) => {
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
          sx={{ color: "var(--mui-palette-text-secondary)" }}
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
        sx={{ color: "var(--mui-palette-text-secondary)" }}
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
      elevation={0}
      sx={[
        {
          position: "sticky",
          gridRow: { xs: 1, md: "auto" },
          top: "16px",
          marginTop: "16px",
          padding: "20px",
          background: "var(--mui-palette-background-paper)",
          border: "1px solid var(--mui-palette-divider)",
          borderRadius: "24px",
          height: "calc(100dvh - 32px)",
          maxHeight: "calc(100dvh - 32px)",
          minWidth: "0",
          overflowY: "auto",
          scrollbarWidth: "thin",
          "& h2": {
            color: "var(--mui-palette-text-primary)",
            margin: "0 0 22px",
          },
          "@media (max-width: 899.95px)": {
            position: "static",
            height: "auto",
            maxHeight: "440px",
            marginTop: "24px",
          },
        },
        { borderRadius: "24px" },
      ]}
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
          sx={{ marginBottom: "16px" }}
        />
      )}
      {tables.length > 0 && (
        <Box
          component="label"
          className="league-select-label"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "7px",
            marginBottom: "16px",
            color: "var(--mui-palette-text-secondary)",
            "& select": {
              width: "100%",
              height: "var(--mui-app-controlHeight)",
              minHeight: "var(--mui-app-controlHeight)",
              padding: "0 12px",
              borderRadius: "12px",
              border: "1px solid var(--mui-palette-divider)",
              background: "var(--mui-app-colors-inputSurface)",
              color: "var(--mui-palette-text-primary)",
            },
            "& select option": {
              background: "var(--mui-palette-background-paper)",
              color: "var(--mui-palette-text-primary)",
            },
            "& select:focus-visible": {
              outline: "2px solid var(--mui-palette-primary-main)",
              outlineOffset: "2px",
            },
          }}
        >
          {secondaryLabel}
          <select
            value={selected?.id ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {options}
          </select>
        </Box>
      )}
      {error && (
        <Box
          className="league-warning"
          role="alert"
          sx={{
            padding: "12px",
            borderRadius: "12px",
            background: "var(--mui-app-colors-warningSurface)",
            color: "var(--mui-app-colors-warningText)",
            marginBottom: "12px",
            "& button": {
              display: "block",
              marginTop: "8px",
              border: "1px solid var(--mui-app-colors-warningBorder)",
              borderRadius: "12px",
              padding: "5px 12px",
              background: "var(--mui-app-colors-transparent)",
              color: "inherit",
            },
          }}
        >
          Unable to update league data. Any displayed records may be out of
          date.
          <button onClick={refresh} disabled={loading}>
            Retry
          </button>
        </Box>
      )}
      {content}
      <Typography
        variant="caption"
        component="p"
        className="league-note"
        sx={{
          color: "var(--mui-palette-text-secondary)",
          margin: "18px 0 0",
          borderTop: "1px solid var(--mui-palette-divider)",
          paddingTop: "14px",
        }}
      >
        {label} · {division.toUpperCase()} · Current season. Updates every 5
        minutes; records may lag live games.
      </Typography>
    </Paper>
  );
};

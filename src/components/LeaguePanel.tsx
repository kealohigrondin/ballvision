import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Stack from "@mui/material/Stack";
import type { SxProps, Theme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { copy } from "../copy";
import type { NflStandingsView } from "../data/types";
import { useCompactWindow } from "../hooks/useCompactWindow";
import { LeagueTable } from "./LeagueTable";
import { TeamSchedule } from "./TeamSchedule";
import { TeamSchedulePicker } from "./TeamSchedulePicker";

type LeaguePanelProps = Record<string, never>;

const panelSx: SxProps<Theme> = {
  p: 2,
  minWidth: 0,
  overflowY: "auto",
};

// Small and wider windows: a panel beside (or above) the scores.
const sidePanelSx: SxProps<Theme> = {
  ...panelSx,
  gridArea: "panel",
  position: { xs: "static", md: "sticky" },
  top: 16,
  mt: 2,
  height: { xs: "auto", md: "calc(100dvh - 32px)" },
  maxHeight: { xs: 440, md: "calc(100dvh - 32px)" },
};

// Compact windows: a standard (non-modal) bottom sheet resting on the
// navigation bar, so the bar stays usable to switch or close the panel.
const bottomSheetSx: SxProps<Theme> = {
  ...panelSx,
  position: "fixed",
  left: 0,
  right: 0,
  bottom: (theme) =>
    `calc(${theme.app.navigationBarHeight}px + env(safe-area-inset-bottom))`,
  zIndex: (theme) => theme.zIndex.appBar,
  maxHeight: "60dvh",
  "&&": { borderRadius: "28px 28px 0 0" },
};

const nflStandingsViews: NflStandingsView[] = [
  "wildcard",
  "division",
  "conference",
];

export const LeaguePanel = ({}: LeaguePanelProps) => {
  const { division, nflStandingsView, setNflStandingsView } = useAppData();
  const compact = useCompactWindow();
  const {
    league: {
      tables,
      loading,
      error,
      refresh,
      view,
      selected,
      setSelectedId,
      visibleTables,
    },
  } = useEspnData();

  // NFL picks a standings view; college picks one conference or poll.
  const picker = useMemo(() => {
    if (division === "nfl") {
      return {
        label: copy.league.standingsView,
        value: nflStandingsView,
        onChange: (value: string) =>
          setNflStandingsView(value as NflStandingsView),
        options: nflStandingsViews.map((option) => (
          <option key={option} value={option}>
            {copy.league.nflViews[option]}
          </option>
        )),
      };
    }

    return {
      label: view === "standings" ? copy.league.conference : copy.league.poll,
      value: selected?.id ?? "",
      onChange: setSelectedId,
      options: tables.map((table) => (
        <option key={table.id} value={table.id}>
          {table.title}
        </option>
      )),
    };
  }, [
    division,
    nflStandingsView,
    setNflStandingsView,
    view,
    selected,
    setSelectedId,
    tables,
  ]);

  const label = useMemo(() => {
    if (view === "schedule") {
      return "Team schedule";
    }
    if (division === "nfl") {
      return "NFL standings";
    }

    return view === "rankings" ? "Top 25" : "Conference standings";
  }, [division, view]);

  const content = useMemo(() => {
    if (view === "schedule") {
      return <TeamSchedule />;
    }
    if (loading && visibleTables.length === 0) {
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
    if (visibleTables.some((table) => table.rows.length > 0)) {
      return (
        <Stack spacing={2}>
          {visibleTables.map((table) => (
            <LeagueTable key={table.id} table={table} />
          ))}
        </Stack>
      );
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
  }, [loading, visibleTables, view]);

  return (
    <Slide in direction={compact ? "up" : "right"} appear>
      <Paper
        component="aside"
        elevation={compact ? 3 : 1}
        sx={compact ? bottomSheetSx : sidePanelSx}
        className="league-panel"
        id="league-panel"
        aria-label={copy.league.panel}
      >
        {view === "schedule" && <TeamSchedulePicker />}
        {view !== "schedule" && tables.length > 0 && (
          <TextField
            select
            fullWidth
            label={picker.label}
            value={picker.value}
            onChange={(e) => picker.onChange(e.target.value)}
            slotProps={{ select: { native: true } }}
            sx={{ mb: 2 }}
          >
            {picker.options}
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

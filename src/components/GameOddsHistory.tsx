import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

import { usePolymarketGame } from "../context/polymarketGameContext";
import type { OddsHistoryRange } from "../data/types";
import { OddsHistoryChart } from "./OddsHistoryChart";
import { SegmentedControl } from "./SegmentedControl";

type GameOddsHistoryProps = Record<string, never>;

export const GameOddsHistory = ({}: GameOddsHistoryProps) => {
  const {
    quote,
    range,
    setRange,
    history: { data, loading, error, refresh },
  } = usePolymarketGame();
  const hasHistory = Boolean(
    data && (data.away.length > 0 || data.home.length > 0),
  );

  const content = useMemo(() => {
    if (!hasHistory && loading)
      return <LinearProgress aria-label="Loading Polymarket odds history" />;
    if (!hasHistory && error)
      return (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" onClick={refresh}>
              Retry
            </Button>
          }
        >
          Unable to load odds history.
        </Alert>
      );
    if (!hasHistory || !data || !quote)
      return (
        <Typography variant="body2" color="text.secondary">
          No polymarket history is available.
        </Typography>
      );
    return <OddsHistoryChart key={range} />;
  }, [hasHistory, loading, error, data, quote, refresh, range]);
  return (
    <Stack
      component="section"
      aria-label="Polymarket odds history"
      spacing={1.5}
      sx={{ minWidth: 0 }}
    >
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Link
          href={quote?.url}
          target="_blank"
          rel="noopener noreferrer"
          variant="subtitle2"
        >
          Polymarket win probability
        </Link>
        <SegmentedControl<OddsHistoryRange>
          label="Odds history range"
          value={range}
          onChange={setRange}
          options={[
            { value: "1h", label: "1H" },
            { value: "6h", label: "6H" },
            { value: "1d", label: "1D" },
          ]}
          buttonSx={{ fontSize: "0.8rem", m: 0 }}
        />
      </Stack>
      {error && hasHistory && (
        <Alert severity="warning">History may be out of date.</Alert>
      )}
      {content}
    </Stack>
  );
};

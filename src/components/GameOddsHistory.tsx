import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";

import { usePolymarketGame } from "../context/polymarketGameContext";
import { copy } from "../copy";
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
    if (!hasHistory && loading) {
      return <LinearProgress aria-label={copy.oddsHistory.loading} />;
    }
    if (!hasHistory && error) {
      return (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" onClick={refresh}>
              {copy.common.retry}
            </Button>
          }
        >
          {copy.oddsHistory.loadError}
        </Alert>
      );
    }
    if (!hasHistory || !data || !quote) {
      return (
        <Typography variant="body2" color="text.secondary">
          {copy.oddsHistory.empty}
        </Typography>
      );
    }

    return <OddsHistoryChart key={range} />;
  }, [hasHistory, loading, error, data, quote, refresh, range]);

  return (
    <Stack
      component="section"
      aria-label={copy.oddsHistory.label}
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
          {copy.oddsHistory.title}
        </Link>
        <SegmentedControl<OddsHistoryRange>
          label={copy.oddsHistory.range}
          value={range}
          onChange={setRange}
          options={(["1h", "6h", "1d"] as const).map((value) => ({
            value,
            label: copy.oddsHistory.ranges[value],
          }))}
          buttonSx={{ fontSize: "0.8rem", m: 0 }}
        />
      </Stack>
      {error && hasHistory && (
        <Alert severity="warning">{copy.oddsHistory.outdated}</Alert>
      )}
      {content}
    </Stack>
  );
};

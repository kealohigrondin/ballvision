import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CirclePause, CirclePlay, RefreshCw } from "lucide-react";
import { useMemo } from "react";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { usePolymarketData } from "../context/polymarketDataContext";
import { copy } from "../copy";
import { MastHeadIconButton } from "./MastHeadIconButton";

type SyncControlsProps = { showLabels?: boolean };

export const SyncControls = ({ showLabels = false }: SyncControlsProps) => {
  const { paused, setPaused } = useAppData();
  const { loading, error, updatedAt, refresh: refreshScores } = useEspnData();
  const { refresh: refreshOdds } = usePolymarketData();
  const pauseLabel = paused ? copy.sync.resume : copy.sync.pause;
  const pauseIcon = paused ? CirclePlay : CirclePause;
  const time = updatedAt?.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  const status = useMemo(() => {
    if (loading) {
      return copy.sync.updating;
    }
    if (paused) {
      return copy.sync.paused;
    }
    if (time) {
      return copy.sync.updated(time);
    }

    return copy.sync.connecting;
  }, [loading, paused, time]);

  return (
    <Stack
      direction={showLabels ? "column" : "row"}
      spacing={1}
      sx={{ alignItems: showLabels ? "flex-start" : "center" }}
    >
      <Typography component="span" role="status" color="text.secondary">
        {status}
        {error && copy.sync.connectionError}
      </Typography>
      <MastHeadIconButton
        icon={pauseIcon}
        label={pauseLabel}
        onClick={() => setPaused((current) => !current)}
        showLabel={showLabels}
      />
      <MastHeadIconButton
        icon={RefreshCw}
        label={copy.sync.refresh}
        onClick={() => {
          refreshScores();
          refreshOdds();
        }}
        disabled={loading}
        showLabel={showLabels}
      />
    </Stack>
  );
};

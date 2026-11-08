import { useEspnData } from "../context/espnDataContext";
import { usePolymarketData } from "../context/polymarketDataContext";
import { useAppData } from "../context/appDataContext";
import { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { MastHeadIconButton } from "./MastHeadIconButton";

import { CirclePause, CirclePlay, RefreshCw } from "lucide-react";
import { copy } from "../copy";

type SyncControlsProps = Record<string, never>;

export const SyncControls = ({}: SyncControlsProps) => {
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
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Typography component="span" role="status" color="text.secondary">
        {status}
        {error && copy.sync.connectionError}
      </Typography>
      <MastHeadIconButton
        icon={pauseIcon}
        label={pauseLabel}
        onClick={() => setPaused((current) => !current)}
      />
      <MastHeadIconButton
        icon={RefreshCw}
        label={copy.sync.refresh}
        onClick={() => {
          refreshScores();
          refreshOdds();
        }}
        disabled={loading}
      />
    </Stack>
  );
};

import { useEspnData } from "../context/espnDataContext";
import { usePolymarketData } from "../context/polymarketDataContext";
import { useAppData } from "../context/appDataContext";
import { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { MastHeadIconButton } from "./MastHeadIconButton";

import { CirclePause, CirclePlay, RefreshCw } from "lucide-react";

type SyncControlsProps = Record<string, never>;

export const SyncControls = ({}: SyncControlsProps) => {
  const { paused, setPaused } = useAppData();
  const { loading, error, updatedAt, refresh: refreshScores } = useEspnData();
  const { refresh: refreshOdds } = usePolymarketData();
  const pauseLabel = paused ? "Resume auto-refresh" : "Pause auto-refresh";
  const pauseIcon = paused ? CirclePlay : CirclePause;
  const time = updatedAt?.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });

  const status = useMemo(() => {
    if (loading) {
      return "Updating…";
    }
    if (paused) {
      return "Auto-refresh paused";
    }
    if (time) {
      return `Updated ${time}`;
    }
    return "Connecting…";
  }, [loading, paused, time]);

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <Typography component="span" role="status" color="text.secondary">
        {status}
        {error && " · Connection error"}
      </Typography>
      <MastHeadIconButton
        icon={pauseIcon}
        label={pauseLabel}
        onClick={() => setPaused((current) => !current)}
      />
      <MastHeadIconButton
        icon={RefreshCw}
        label="Refresh scores"
        onClick={() => {
          refreshScores();
          refreshOdds();
        }}
        disabled={loading}
      />
    </Stack>
  );
};

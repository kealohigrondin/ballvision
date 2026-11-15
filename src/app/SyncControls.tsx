import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CirclePause, CirclePlay, RefreshCw } from "lucide-react";
import { useMemo } from "react";

import { copy } from "@/copy";
import { usePolymarketData } from "@/features/odds";
import { useScoresData } from "@/features/scores";
import { useAppData } from "@/shared/appData/appDataContext";
import { ToolbarIconButton } from "@/shared/components/ToolbarIconButton";

type SyncControlsProps = { showLabels?: boolean };

export const SyncControls = ({ showLabels = false }: SyncControlsProps) => {
  const { paused, setPaused } = useAppData();
  const { loading, error, updatedAt, refresh: refreshScores } = useScoresData();
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
      <ToolbarIconButton
        icon={pauseIcon}
        label={pauseLabel}
        onClick={() => setPaused((current) => !current)}
        showLabel={showLabels}
      />
      <ToolbarIconButton
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

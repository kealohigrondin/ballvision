import IconButton from "@mui/material/IconButton";
import { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import { CirclePause, CirclePlay, RefreshCw } from "lucide-react";

type SyncControlsProps = {
  loading: boolean;
  paused: boolean;
  error: string | null;
  updatedAt: Date | null;
  onTogglePause: () => void;
  onRefresh: () => void;
};

export const SyncControls = ({
  loading,
  paused,
  error,
  updatedAt,
  onTogglePause,
  onRefresh,
}: SyncControlsProps) => {
  const pauseLabel = paused ? "Resume auto-refresh" : "Pause auto-refresh";
  const pauseIcon = paused ? (
    <CirclePlay size={17} />
  ) : (
    <CirclePause size={17} />
  );
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
      <Typography
        variant="caption"
        component="span"
        role="status"
        color="text.secondary"
      >
        {status}
        {error && " · Connection error"}
      </Typography>
      <IconButton
        title={pauseLabel}
        aria-label={pauseLabel}
        onClick={onTogglePause}
      >
        {pauseIcon}
      </IconButton>
      <IconButton
        aria-label="Refresh scores"
        title="Refresh scores"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw />
      </IconButton>
    </Stack>
  );
};

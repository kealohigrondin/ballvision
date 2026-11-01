import { iconButtonSx, liveDotSx } from "../styles/shared";
import Box from "@mui/material/Box";
import { useMemo } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import clsx from "clsx";

import { CirclePause, CirclePlay, RefreshCw, WifiOff } from "lucide-react";

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
  const indicator = error ? (
    <WifiOff size={13} />
  ) : (
    <Box
      component="span"
      className={clsx("sync-dot", paused && "paused")}
      sx={[
        liveDotSx,
        { "&.paused": { background: "var(--mui-app-colors-paused)" } },
      ]}
    />
  );
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
    <Stack
      direction="row"
      className="sync-controls"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <Typography
        variant="caption"
        component="span"
        className={clsx("sync-status", error && "has-error")}
        role="status"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "var(--mui-palette-text-secondary)",
          marginRight: "4px",
          "&.has-error": { color: "var(--mui-app-colors-syncWarning)" },
        }}
      >
        {indicator}
        {status}
      </Typography>
      <Box
        component="button"
        className="icon-button"
        title={pauseLabel}
        aria-label={pauseLabel}
        onClick={onTogglePause}
        sx={iconButtonSx}
      >
        {pauseIcon}
      </Box>
      <Box
        component="button"
        className={clsx("icon-button", loading && "spinning")}
        sx={[
          iconButtonSx,
          { "&.spinning svg": { animation: "rotate 1.5s linear infinite" } },
        ]}
        aria-label="Refresh scores"
        title="Refresh scores"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw size={16} />
      </Box>
    </Stack>
  );
};

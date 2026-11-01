import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import clsx from "clsx";
import "./styles/SyncControls.css";
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
    <span className={clsx("sync-dot", paused && "paused")} />
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
  const getStatus = () => {
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
  };
  const status = getStatus();

  return (
    <Stack direction="row" className="sync-controls">
      <Typography
        variant="caption"
        component="span"
        className={clsx("sync-status", error && "has-error")}
        role="status"
      >
        {indicator}
        {status}
      </Typography>
      <button
        className="icon-button"
        title={pauseLabel}
        aria-label={pauseLabel}
        onClick={onTogglePause}
      >
        {pauseIcon}
      </button>
      <button
        className={clsx("icon-button", loading && "spinning")}
        aria-label="Refresh scores"
        title="Refresh scores"
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw size={16} />
      </button>
    </Stack>
  );
};

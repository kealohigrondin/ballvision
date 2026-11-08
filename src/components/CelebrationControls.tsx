import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Flame, Volume2, VolumeX } from "lucide-react";
import { useScoreCelebration } from "../context/scoreCelebrationContext";

type CelebrationControlsProps = Record<string, never>;
export const CelebrationControls = ({}: CelebrationControlsProps) => {
  const {
    soundArmed,
    muted,
    enableSound,
    toggleMute,
    preview,
    previewAvailable,
    audioUnavailable,
  } = useScoreCelebration();
  const enableLabel = audioUnavailable
    ? "Retry chaos sounds"
    : "Enable chaos sounds";
  const soundLabel = muted ? "Unmute chaos sounds" : "Mute chaos sounds";
  const soundIcon = muted ? <VolumeX size={20} /> : <Volume2 size={20} />;
  const soundControl = soundArmed ? (
    <IconButton aria-label={soundLabel} title={soundLabel} onClick={toggleMute}>
      {soundIcon}
    </IconButton>
  ) : (
    <Button
      startIcon={<Volume2 size={18} />}
      onClick={() => void enableSound()}
    >
      {enableLabel}
    </Button>
  );
  return (
    <>
      {soundControl}
      <Tooltip title="Preview the score celebration">
        <span>
          <IconButton
            aria-label="Test score celebration"
            onClick={preview}
            disabled={!previewAvailable}
          >
            <Flame size={20} />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
};

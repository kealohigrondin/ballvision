import Tooltip from "@mui/material/Tooltip";
import { Flame, Volume2, VolumeX } from "lucide-react";
import { useScoreCelebration } from "../context/scoreCelebrationContext";
import { MastHeadIconButton } from "./MastHeadIconButton";

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
  const soundControl = soundArmed ? (
    <MastHeadIconButton
      icon={muted ? VolumeX : Volume2}
      label={soundLabel}
      onClick={toggleMute}
    />
  ) : (
    <Tooltip title={enableLabel}>
      <span>
        <MastHeadIconButton
          icon={Volume2}
          label={enableLabel}
          title={null}
          onClick={() => void enableSound()}
        />
      </span>
    </Tooltip>
  );
  return (
    <>
      {soundControl}
      <Tooltip title="Preview the score celebration">
        <span>
          <MastHeadIconButton
            icon={Flame}
            label="Test score celebration"
            title={null}
            onClick={preview}
            disabled={!previewAvailable}
          />
        </span>
      </Tooltip>
    </>
  );
};

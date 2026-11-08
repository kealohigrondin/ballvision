import Tooltip from "@mui/material/Tooltip";
import { BellOff, BellRing, Flame } from "lucide-react";
import { useScoreNotification } from "../context/scoreNotificationContext";
import { MastHeadIconButton } from "./MastHeadIconButton";

type ScoreNotificationControlsProps = Record<string, never>;
export const ScoreNotificationControls =
  ({}: ScoreNotificationControlsProps) => {
    const {
      soundArmed,
      muted,
      enableSound,
      toggleMute,
      preview,
      previewAvailable,
      audioUnavailable,
    } = useScoreNotification();
    const enableLabel = audioUnavailable
      ? "Retry chaos sounds"
      : "Enable chaos sounds";
    const soundLabel = muted ? "Unmute chaos sounds" : "Mute chaos sounds";
    const soundControl = soundArmed ? (
      <MastHeadIconButton
        icon={muted ? BellOff : BellRing}
        label={soundLabel}
        onClick={toggleMute}
      />
    ) : (
      <Tooltip title={enableLabel}>
        <span>
          <MastHeadIconButton
            icon={BellOff}
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
        <Tooltip title="Preview the score notification">
          <span>
            <MastHeadIconButton
              icon={Flame}
              label="Test score notification"
              title={null}
              onClick={preview}
              disabled={!previewAvailable}
            />
          </span>
        </Tooltip>
      </>
    );
  };

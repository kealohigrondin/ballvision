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

    return (
      <>
        {soundArmed ? (
          <MastHeadIconButton
            icon={muted ? BellOff : BellRing}
            label={soundLabel}
            onClick={toggleMute}
          />
        ) : (
          <MastHeadIconButton
            icon={BellOff}
            label={enableLabel}
            onClick={() => void enableSound()}
          />
        )}
        <MastHeadIconButton
          icon={Flame}
          label="Test score notification"
          onClick={preview}
          disabled={!previewAvailable}
        />
      </>
    );
  };

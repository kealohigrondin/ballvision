import { BellOff, BellRing, Flame } from "lucide-react";

import { useScoreNotification } from "../context/scoreNotificationContext";
import { copy } from "../copy";
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
      ? copy.scoreNotification.retrySound
      : copy.scoreNotification.enableSound;
    const soundLabel = muted
      ? copy.scoreNotification.unmuteSound
      : copy.scoreNotification.muteSound;

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
          label={copy.scoreNotification.test}
          onClick={preview}
          disabled={!previewAvailable}
        />
      </>
    );
  };

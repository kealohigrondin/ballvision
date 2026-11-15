import { BellOff, BellRing, Flame } from "lucide-react";

import { copy } from "@/copy";
import { ToolbarIconButton } from "@/shared/components/ToolbarIconButton";

import { useScoreNotification } from "./scoreNotificationContext";

type ScoreNotificationControlsProps = { showLabels?: boolean };

export const ScoreNotificationControls = ({
  showLabels = false,
}: ScoreNotificationControlsProps) => {
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
        <ToolbarIconButton
          icon={muted ? BellOff : BellRing}
          label={soundLabel}
          onClick={toggleMute}
          showLabel={showLabels}
        />
      ) : (
        <ToolbarIconButton
          icon={BellOff}
          label={enableLabel}
          onClick={() => void enableSound()}
          showLabel={showLabels}
        />
      )}
      <ToolbarIconButton
        icon={Flame}
        label={copy.scoreNotification.test}
        onClick={preview}
        disabled={!previewAvailable}
        showLabel={showLabels}
      />
    </>
  );
};

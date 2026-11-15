import {
  BellOff,
  BellRing,
  Flame,
  MonitorCheck,
  MonitorOff,
  MonitorX,
} from "lucide-react";
import { useMemo } from "react";

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
    desktopSupported,
    desktopEnabled,
    desktopBlocked,
    toggleDesktopAlerts,
  } = useScoreNotification();
  const enableLabel = audioUnavailable
    ? copy.scoreNotification.retrySound
    : copy.scoreNotification.enableSound;
  const soundLabel = muted
    ? copy.scoreNotification.unmuteSound
    : copy.scoreNotification.muteSound;

  const desktop = useMemo(() => {
    if (desktopBlocked) {
      return { icon: MonitorX, label: copy.scoreNotification.desktopBlocked };
    }

    return desktopEnabled
      ? { icon: MonitorCheck, label: copy.scoreNotification.desktopOff }
      : { icon: MonitorOff, label: copy.scoreNotification.desktopOn };
  }, [desktopBlocked, desktopEnabled]);

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
      {desktopSupported && (
        <ToolbarIconButton
          icon={desktop.icon}
          label={desktop.label}
          onClick={() => void toggleDesktopAlerts()}
          disabled={desktopBlocked}
          showLabel={showLabels}
        />
      )}
    </>
  );
};

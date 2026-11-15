import { useEffect, useRef } from "react";

import type { Game } from "@/shared/types";

import type { ChaosAudio } from "./audio/chaosAudio";
import type { DesktopNotifier } from "./desktopNotifier";
import { notificationSoundKind } from "./scoreNotifications";
import { useChaosAudio } from "./useChaosAudio";
import { useDesktopNotifications } from "./useDesktopNotifications";
import { useScoreNotifications } from "./useScoreNotifications";

export type ScoreNotificationOptions = {
  games: readonly Game[];
  /** Changes whenever the scoreboard switches to another slate of games. */
  slateKey: string;
  /** True once the latest scoreboard update arrived without an error. */
  ready: boolean;
  favoriteIds: readonly string[];
  audioFactory?: () => ChaosAudio;
  /** Shows alerts on the desktop; defaults to the browser's notifications. */
  desktopNotifier?: DesktopNotifier;
};

export const useScoreNotificationState = ({
  games,
  slateKey,
  ready,
  favoriteIds,
  audioFactory,
  desktopNotifier,
}: ScoreNotificationOptions) => {
  const { alerts, ...events } = useScoreNotifications(
    games,
    slateKey,
    ready,
    favoriteIds,
  );
  const desktop = useDesktopNotifications(alerts, desktopNotifier);
  const audio = useChaosAudio(audioFactory);
  const played = useRef<string | undefined>(undefined);

  useEffect(() => {
    const event = events.current;
    const id = event?.id;
    if (event && id && played.current !== id) {
      played.current = id;
      audio.play(notificationSoundKind(event));
    }

    return audio.stop;
  }, [events.current?.id, audio.play, audio.stop]);

  return {
    ...events,
    soundArmed: audio.armed,
    muted: audio.muted,
    audioUnavailable: audio.unavailable,
    enableSound: audio.enable,
    toggleMute: audio.toggleMute,
    ...desktop,
  };
};

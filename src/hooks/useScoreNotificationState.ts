import { useEffect, useRef } from "react";

import type { ChaosAudio } from "../audio/chaosAudio";
import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { notificationSoundKind } from "../utils/scoreNotifications";
import { useChaosAudio } from "./useChaosAudio";
import { useScoreNotifications } from "./useScoreNotifications";

export const useScoreNotificationState = (audioFactory?: () => ChaosAudio) => {
  const { week, division, favoriteIds } = useAppData();
  const { games, updatedAt, error } = useEspnData();
  const events = useScoreNotifications(
    games,
    `${division}:${week?.id ?? "current"}`,
    updatedAt !== null && !error,
    favoriteIds,
  );
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
  };
};

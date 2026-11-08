import { useEffect, useRef } from "react";
import { notificationSoundKind } from "../utils/scoreNotifications";
import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { useScoreNotifications } from "./useScoreNotifications";
import { useChaosAudio } from "./useChaosAudio";
import type { ChaosAudio } from "../audio/chaosAudio";

export const useScoreNotificationState = (audioFactory?: () => ChaosAudio) => {
  const { date, division, favoriteIds } = useAppData();
  const { games, updatedAt, error } = useEspnData();
  const events = useScoreNotifications(
    games,
    `${division}:${date}`,
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

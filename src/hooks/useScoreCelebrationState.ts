import { useEffect, useRef } from "react";
import { celebrationSoundKind } from "../utils/scoreCelebrations";
import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { useScoreCelebrations } from "./useScoreCelebrations";
import { useChaosAudio } from "./useChaosAudio";
import type { ChaosAudio } from "../audio/chaosAudio";

export const useScoreCelebrationState = (audioFactory?: () => ChaosAudio) => {
  const { week, division, favoriteIds } = useAppData();
  const { games, updatedAt, error } = useEspnData();
  const events = useScoreCelebrations(
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
      audio.play(celebrationSoundKind(event));
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

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createChaosAudio,
  type ChaosAudio,
  type ScoreAlertKind,
} from "../audio/chaosAudio";

export const useChaosAudio = (factory: () => ChaosAudio = createChaosAudio) => {
  const engine = useRef<ChaosAudio | undefined>(undefined);
  const [armed, setArmed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const enable = useCallback(async () => {
    try {
      engine.current ??= factory();
      await engine.current.unlock();
      setArmed(true);
      setMuted(false);
      setUnavailable(false);
    } catch {
      setUnavailable(true);
    }
  }, [factory]);
  const toggleMute = useCallback(() => {
    engine.current?.stop();
    setMuted((value) => !value);
  }, []);
  const play = useCallback(
    (kind: ScoreAlertKind = "score") => {
      if (armed && !muted) engine.current?.play(kind);
    },
    [armed, muted],
  );
  const stop = useCallback(() => engine.current?.stop(), []);
  useEffect(() => () => engine.current?.dispose(), []);
  return { armed, muted, unavailable, enable, toggleMute, play, stop };
};

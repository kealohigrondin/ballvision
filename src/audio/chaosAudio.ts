import airhornUrl from "./dj-airhorn-sound-effect.mp3";
import tripleUrl from "./oh-baby-a-triple.mp3";
import bangarangUrl from "./untitled_313.mp3";
import anothaone from "./anothaone.mp3";
import foxSports from "./fox-sports-bass-boosted-exe.mp3";
import sixseven from "./sixseven.mp3";
import wiiSports from "./wii_sports_sms.mp3";

export type ScoreAlertKind = "score" | "fieldGoal" | "pat" | "sixSeven";

const alertSoundUrls = [
  { url: tripleUrl, kind: "fieldGoal" }, // field goals only
  { url: sixseven, kind: "sixSeven" }, // score is 6-7 or 7-6
  { url: anothaone, kind: "pat" }, // PAT
  { url: airhornUrl, kind: "score" }, // pick randomly on score events
  { url: bangarangUrl, kind: "score" }, // pick randomly on score events
  { url: foxSports, kind: "score" }, // pick randomly on score events
  { url: wiiSports, kind: "score" }, // pick randomly on score events
] satisfies { url: string; kind: ScoreAlertKind }[];

export interface ChaosAudio {
  unlock(): Promise<void>;
  play(kind?: ScoreAlertKind): void;
  stop(): void;
  dispose(): void;
}

export const createChaosAudio = (): ChaosAudio => {
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = 0.6;
  const limiter = context.createDynamicsCompressor();
  limiter.threshold.value = -8;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.002;
  limiter.release.value = 0.1;
  master.connect(limiter).connect(context.destination);
  let sounds = new Map<string, AudioBuffer>();
  let loading: Promise<void> | undefined;
  const loadSounds = () => {
    loading ??= Promise.all(
      alertSoundUrls.map(async ({ url }) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Unable to load score alert audio.");
        const buffer = await context.decodeAudioData(
          await response.arrayBuffer(),
        );
        return [url, buffer] as const;
      }),
    )
      .then((buffers) => {
        sounds = new Map(buffers);
      })
      .catch((error: unknown) => {
        loading = undefined;
        throw error;
      });
    return loading;
  };
  const active = new Set<AudioScheduledSourceNode>();
  const track = (node: AudioScheduledSourceNode) => {
    active.add(node);
    node.onended = () => active.delete(node);
  };
  const stop = () => {
    for (const node of active) {
      try {
        node.stop();
      } catch {
        /* Already ended. */
      }
    }
    active.clear();
  };
  return {
    unlock: async () => {
      await Promise.all([context.resume(), loadSounds()]);
      if (context.state !== "running") throw new Error("Audio is not running.");
    },
    play: (kind = "score") => {
      if (context.state !== "running" || sounds.size === 0) return;
      stop();
      const source = context.createBufferSource();
      const candidates = alertSoundUrls.filter((sound) => sound.kind === kind);
      const selected =
        candidates[Math.floor(Math.random() * candidates.length)];
      source.buffer = sounds.get(selected.url) ?? null;
      source.connect(master);
      track(source);
      source.start(context.currentTime + 0.02);
    },
    stop,
    dispose: () => {
      stop();
      void context.close().catch(() => {});
    },
  };
};

import { afterEach, expect, it, vi } from "vitest";
import { createChaosAudio } from "../src/audio/chaosAudio";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("caches all clips, selects the matching score sound, and stops on mute", async () => {
  const param = () => ({
    value: 0,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  });
  const node = () => {
    const result = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      gain: param(),
      frequency: param(),
      Q: param(),
      threshold: param(),
      knee: param(),
      ratio: param(),
      attack: param(),
      release: param(),
      buffer: undefined as unknown,
    };
    result.connect.mockImplementation(() => result);
    return result;
  };
  const decoded = Array.from({ length: 7 }, (_, index) => ({
    duration: index + 1,
  }));
  let decodeIndex = 0;
  const sources: ReturnType<typeof node>[] = [];
  const context = {
    state: "running",
    currentTime: 0,
    sampleRate: 100,
    destination: node(),
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    decodeAudioData: vi.fn(async () => decoded[decodeIndex++]),
    createGain: node,
    createDynamicsCompressor: node,
    createOscillator: node,
    createBiquadFilter: node,
    createBuffer: () => ({ getChannelData: () => new Float32Array(100) }),
    createBufferSource: () => {
      const source = node();
      sources.push(source);
      return source;
    },
  };
  vi.stubGlobal(
    "AudioContext",
    class {
      constructor() {
        return context;
      }
    },
  );
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(4),
  });
  vi.stubGlobal("fetch", fetch);
  const audio = createChaosAudio();
  await audio.unlock();
  await audio.unlock();
  expect(fetch).toHaveBeenCalledTimes(7);
  expect(fetch.mock.calls.map(([url]) => url)).toEqual([
    expect.stringContaining("oh-baby-a-triple.mp3"),
    expect.stringContaining("sixseven.mp3"),
    expect.stringContaining("anothaone.mp3"),
    expect.stringContaining("dj-airhorn-sound-effect.mp3"),
    expect.stringContaining("untitled_313.mp3"),
    expect.stringContaining("fox-sports-bass-boosted-exe.mp3"),
    expect.stringContaining("wii_sports_sms.mp3"),
  ]);
  const random = vi.spyOn(Math, "random");
  for (const [index, value] of [0, 0.25, 0.5, 0.999].entries()) {
    random.mockReturnValue(value);
    audio.play();
    expect(sources).toHaveLength(index + 1);
    expect(sources[index].buffer).toBe(decoded[index + 3]);
    expect(sources[index].start).toHaveBeenCalled();
    if (index > 0) expect(sources[index - 1].stop).toHaveBeenCalled();
  }
  for (const [index, kind] of (
    ["fieldGoal", "sixSeven", "pat"] as const
  ).entries()) {
    audio.play(kind);
    expect(sources[index + 4].buffer).toBe(decoded[index]);
    expect(sources[index + 4].start).toHaveBeenCalled();
  }
  expect(sources).toHaveLength(7);
  audio.stop();
  expect(sources[6].stop).toHaveBeenCalled();
  audio.dispose();
  expect(context.close).toHaveBeenCalled();
});

import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useChaosAudio } from "../src/hooks/useChaosAudio";

const engine = () => ({
  unlock: vi.fn().mockResolvedValue(undefined),
  play: vi.fn(),
  stop: vi.fn(),
  dispose: vi.fn(),
});
afterEach(cleanup);
it("requires activation, obeys mute immediately, and disposes audio on unmount", async () => {
  const audio = engine();
  const factory = vi.fn(() => audio);
  const { result, unmount } = renderHook(() => useChaosAudio(factory));
  act(() => result.current.play());
  expect(factory).not.toHaveBeenCalled();
  await act(async () => result.current.enable());
  act(() => result.current.play());
  expect(audio.play).toHaveBeenCalledTimes(1);
  act(() => result.current.toggleMute());
  act(() => result.current.play());
  expect(audio.stop).toHaveBeenCalled();
  expect(audio.play).toHaveBeenCalledTimes(1);
  unmount();
  expect(audio.dispose).toHaveBeenCalled();
});
it("allows retrying when the browser initially rejects activation", async () => {
  const audio = engine();
  audio.unlock.mockRejectedValueOnce(new Error("Blocked"));
  const { result } = renderHook(() => useChaosAudio(() => audio));
  await act(async () => result.current.enable());
  expect(result.current.unavailable).toBe(true);
  await act(async () => result.current.enable());
  expect(result.current.armed).toBe(true);
  expect(result.current.unavailable).toBe(false);
});

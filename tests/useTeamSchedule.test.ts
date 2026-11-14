import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type {
  TeamSchedule,
  TeamScheduleSource,
} from "@/features/schedule/types";
import { useTeamSchedule } from "@/features/schedule/useTeamSchedule";
import type { Division } from "@/shared/types";

import { scheduleGame } from "./helpers/scheduleFixture";

const data = { season: "2026", games: [scheduleGame] };
afterEach(cleanup);

it("waits for a team and an open schedule page before loading", async () => {
  const source = {
    load: vi.fn<TeamScheduleSource["load"]>().mockResolvedValue(data),
  };
  const { result, rerender } = renderHook(
    ({ teamId, enabled }) => useTeamSchedule(source, "fbs", teamId, enabled),
    { initialProps: { teamId: "", enabled: true } },
  );
  rerender({ teamId: "1", enabled: false });
  expect(source.load).not.toHaveBeenCalled();
  rerender({ teamId: "1", enabled: true });
  await waitFor(() => expect(result.current.data).toEqual(data));
  expect(source.load).toHaveBeenCalledWith(
    { division: "fbs", teamId: "1" },
    expect.any(AbortSignal),
  );
});

it("drops the previous division's schedule when the division changes", async () => {
  const source = {
    load: vi.fn<TeamScheduleSource["load"]>().mockResolvedValue(data),
  };
  const { result, rerender } = renderHook(
    ({ division }) => useTeamSchedule(source, division, "1", false),
    { initialProps: { division: "fbs" as Division } },
  );
  rerender({ division: "nfl" });
  expect(result.current.data).toBeUndefined();
});

it("aborts old team requests and ignores their late results", async () => {
  let resolveOld!: (data: TeamSchedule) => void;
  const source = {
    load: vi
      .fn<TeamScheduleSource["load"]>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValueOnce({ ...data, season: "new team" }),
  };
  const { result, rerender } = renderHook(
    ({ teamId }) => useTeamSchedule(source, "fbs", teamId, true),
    { initialProps: { teamId: "1" } },
  );
  await waitFor(() => expect(source.load).toHaveBeenCalledTimes(1));
  const signal = source.load.mock.calls[0][1];
  rerender({ teamId: "2" });
  await waitFor(() => expect(result.current.data?.season).toBe("new team"));
  expect(signal.aborted).toBe(true);
  await act(async () => resolveOld(data));
  expect(result.current.data?.season).toBe("new team");
});

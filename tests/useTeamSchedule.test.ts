import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type {
  Division,
  TeamSchedule,
  TeamScheduleSource,
} from "../src/data/types";
import { useTeamSchedule } from "../src/hooks/useTeamSchedule";
import { scheduleGame } from "./helpers/scheduleFixture";
const team = { id: "1", name: "Georgia", record: "7-1" };
const data = { season: "2026", games: [scheduleGame] };
afterEach(cleanup);
it("waits for selection and an open schedule tab, preserves selection on close, and clears it across divisions", async () => {
  const source = {
    load: vi.fn<TeamScheduleSource["load"]>().mockResolvedValue(data),
  };
  const { result, rerender } = renderHook(
    ({ enabled, division }) => useTeamSchedule(source, division, enabled),
    { initialProps: { enabled: false, division: "fbs" as Division } },
  );
  act(() => result.current.selectTeam(team));
  expect(source.load).not.toHaveBeenCalled();
  rerender({ enabled: true, division: "fbs" });
  await waitFor(() => expect(result.current.data).toEqual(data));
  rerender({ enabled: false, division: "fbs" });
  expect(source.load).toHaveBeenCalledTimes(1);
  expect(result.current.selectedTeam?.id).toBe("1");
  rerender({ enabled: true, division: "nfl" });
  expect(result.current.selectedTeam).toBeUndefined();
  expect(result.current.data).toBeUndefined();
  expect(source.load).toHaveBeenCalledTimes(1);
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
  const { result } = renderHook(() => useTeamSchedule(source, "fbs", true));
  act(() => result.current.selectTeam(team));
  await waitFor(() => expect(source.load).toHaveBeenCalledTimes(1));
  const signal = source.load.mock.calls[0][1];
  act(() => result.current.selectTeam({ ...team, id: "2", name: "Miami" }));
  await waitFor(() => expect(result.current.data?.season).toBe("new team"));
  expect(signal.aborted).toBe(true);
  await act(async () => resolveOld(data));
  expect(result.current.data?.season).toBe("new team");
});

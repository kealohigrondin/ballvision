import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { parseTeamStats } from "@/features/stats/espnStats";
import type { TeamStats, TeamStatsSource } from "@/features/stats/types";
import { useTeamStats } from "@/features/stats/useTeamStats";

const payload = {
  status: "success",
  season: { year: 2026, type: 2, displayName: "2026" },
  team: { id: "26", displayName: "Seattle Seahawks" },
  results: {
    stats: {
      categories: [
        {
          name: "passing",
          displayName: "Passing",
          stats: [
            {
              name: "completionPct",
              displayName: "Completion Percentage",
              shortDisplayName: "CMP%",
              description: "The percentage of completed passes.",
              abbreviation: "CMP%",
              value: 63.2,
              displayValue: "63.2",
              perGameValue: 64.096,
              perGameDisplayValue: "64.096",
            },
            {
              name: "interceptions",
              displayName: "Interceptions",
              abbreviation: "INT",
              value: 8,
              displayValue: "8",
            },
          ],
        },
        { name: "empty", displayName: "Empty", stats: [] },
      ],
    },
  },
};

const stats: TeamStats = {
  teamId: "26",
  season: "2026",
  categories: [],
};

afterEach(cleanup);

describe("parseTeamStats", () => {
  it("reads each category's stats with totals and per-game values", () => {
    const parsed = parseTeamStats(payload, "26");
    expect(parsed.season).toBe("2026");
    expect(parsed.categories[0]).toMatchObject({
      name: "passing",
      label: "Passing",
    });
    expect(parsed.categories[0].stats[0]).toEqual({
      name: "completionPct",
      label: "Completion Percentage",
      abbreviation: "CMP%",
      description: "The percentage of completed passes.",
      value: 63.2,
      displayValue: "63.2",
      perGameValue: 64.096,
      perGameDisplayValue: "64.096",
    });
  });

  it("leaves per-game values unset when ESPN omits them", () => {
    const stat = parseTeamStats(payload, "26").categories[0].stats[1];
    expect(stat.perGameValue).toBeUndefined();
    expect(stat.perGameDisplayValue).toBeUndefined();
  });

  it("drops categories without stats", () => {
    const names = parseTeamStats(payload, "26").categories.map((c) => c.name);
    expect(names).toEqual(["passing"]);
  });

  it("rejects payloads without stat categories", () => {
    expect(() => parseTeamStats({ results: {} }, "26")).toThrow();
  });
});

describe("useTeamStats", () => {
  it("waits for a team before loading", () => {
    const source = { load: vi.fn<TeamStatsSource["load"]>() };
    renderHook(() => useTeamStats(source, "nfl", "", true));
    expect(source.load).not.toHaveBeenCalled();
  });

  it("does not load while disabled", () => {
    const source = { load: vi.fn<TeamStatsSource["load"]>() };
    renderHook(() => useTeamStats(source, "nfl", "26", false));
    expect(source.load).not.toHaveBeenCalled();
  });

  it("loads the selected team's stats", async () => {
    const source = {
      load: vi.fn<TeamStatsSource["load"]>().mockResolvedValue(stats),
    };
    const { result } = renderHook(() =>
      useTeamStats(source, "nfl", "26", true),
    );
    await waitFor(() => expect(result.current.data).toEqual(stats));
    expect(source.load).toHaveBeenCalledWith(
      { division: "nfl", teamId: "26" },
      expect.any(AbortSignal),
    );
  });

  it("reports a failed load", async () => {
    const source = {
      load: vi.fn<TeamStatsSource["load"]>().mockRejectedValue(new Error("x")),
    };
    const { result } = renderHook(() =>
      useTeamStats(source, "nfl", "26", true),
    );
    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it("clears the previous team's stats when the team changes", async () => {
    const source = {
      load: vi
        .fn<TeamStatsSource["load"]>()
        .mockResolvedValueOnce(stats)
        .mockReturnValueOnce(new Promise(() => {})),
    };
    const { result, rerender } = renderHook(
      ({ teamId }) => useTeamStats(source, "nfl", teamId, true),
      { initialProps: { teamId: "26" } },
    );
    await waitFor(() => expect(result.current.data).toEqual(stats));
    rerender({ teamId: "12" });
    expect(result.current.data).toBeUndefined();
  });
});

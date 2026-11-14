import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useAppDataState } from "../src/hooks/useAppDataState";
import {
  APP_PREFERENCES_KEY,
  defaultAppPreferences,
  loadAppPreferences,
  saveAppPreferences,
} from "../src/utils/appPreferences";

const week = {
  id: "2026-2-10",
  label: "Week 10",
  group: "Regular Season",
  detail: "Nov 4-10",
  year: 2026,
  seasonType: 2,
  number: 10,
};

afterEach(() => {
  cleanup();
  localStorage.removeItem(APP_PREFERENCES_KEY);
  localStorage.removeItem("ballvision:favorites:v1");
});

it("restores all app controls after unmounting and mounting again", () => {
  const first = renderHook(() => useAppDataState());
  act(() => {
    first.result.current.setPanelOpen(false);
    first.result.current.setWeek(week);
    first.result.current.setDivision("fcs");
    first.result.current.setFilter("pinned");
    first.result.current.setSearch("Seattle");
    first.result.current.setPaused(true);
    first.result.current.setNflStandingsView("conference");
    first.result.current.setStandingsConferenceId("acc");
    first.result.current.setSleeperUsername("AaronY");
  });
  expect(JSON.parse(localStorage.getItem(APP_PREFERENCES_KEY)!)).toEqual({
    version: 1,
    panelOpen: false,
    week,
    division: "fcs",
    filter: "pinned",
    search: "Seattle",
    paused: true,
    nflStandingsView: "conference",
    standingsConferenceId: "acc",
    sleeperUsername: "AaronY",
  });
  first.unmount();
  const next = renderHook(() => useAppDataState());
  expect(next.result.current).toMatchObject({
    panelOpen: false,
    week,
    division: "fcs",
    filter: "pinned",
    search: "Seattle",
    paused: true,
    nflStandingsView: "conference",
    standingsConferenceId: "acc",
    sleeperUsername: "AaronY",
  });
});
it("validates restored fields independently, including malformed weeks", () => {
  const storage = {
    getItem: vi.fn().mockReturnValue(
      JSON.stringify({
        version: 1,
        panelOpen: "false",
        week: { ...week, number: "10" },
        division: "fcs",
        filter: "bad-filter",
        search: "Montana",
        paused: 1,
      }),
    ),
  };
  expect(loadAppPreferences(storage)).toEqual({
    ...defaultAppPreferences(),
    division: "fcs",
    search: "Montana",
  });
});
it("falls back to defaults for malformed data and unknown schema versions", () => {
  for (const value of [
    "invalid JSON",
    "null",
    "[]",
    JSON.stringify({ version: 2, division: "nfl" }),
  ]) {
    expect(loadAppPreferences({ getItem: () => value })).toEqual(
      defaultAppPreferences(),
    );
  }
});
it("continues without errors when browser storage is blocked", () => {
  const getItem = () => {
    throw new Error("Blocked");
  };

  const setItem = () => {
    throw new Error("Quota exceeded");
  };
  expect(loadAppPreferences({ getItem })).toEqual(defaultAppPreferences());
  expect(() =>
    saveAppPreferences(defaultAppPreferences(), { setItem }),
  ).not.toThrow();
});

it("defaults the NFL standings view to wildcard", () => {
  expect(defaultAppPreferences().nflStandingsView).toBe("wildcard");
});

it("falls back to the wildcard view for an unknown saved NFL view", () => {
  const storage = {
    getItem: vi
      .fn()
      .mockReturnValue(
        JSON.stringify({ version: 1, nflStandingsView: "playoffs" }),
      ),
  };
  expect(loadAppPreferences(storage).nflStandingsView).toBe("wildcard");
});

it("falls back to the first conference for a malformed saved conference", () => {
  const storage = {
    getItem: vi
      .fn()
      .mockReturnValue(
        JSON.stringify({ version: 1, standingsConferenceId: 8 }),
      ),
  };
  expect(loadAppPreferences(storage).standingsConferenceId).toBe("");
});

it("falls back to no Sleeper username when the stored one is not text", () => {
  const storage = {
    getItem: vi
      .fn()
      .mockReturnValue(JSON.stringify({ version: 1, sleeperUsername: 42 })),
  };
  expect(loadAppPreferences(storage).sleeperUsername).toBe("");
});

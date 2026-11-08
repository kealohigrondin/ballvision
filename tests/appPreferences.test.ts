import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useAppDataState } from "../src/hooks/useAppDataState";
import {
  APP_PREFERENCES_KEY,
  defaultAppPreferences,
  loadAppPreferences,
  saveAppPreferences,
} from "../src/utils/appPreferences";

afterEach(() => {
  cleanup();
  localStorage.removeItem(APP_PREFERENCES_KEY);
  localStorage.removeItem("saturday:favorites:v1");
});

it("restores all app controls after unmounting and mounting again", () => {
  const first = renderHook(() => useAppDataState());
  act(() => {
    first.result.current.setPanelOpen(false);
    first.result.current.setDate("2026-11-08");
    first.result.current.setDivision("nfl");
    first.result.current.setFilter("pinned");
    first.result.current.setSearch("Seattle");
    first.result.current.setPaused(true);
  });
  expect(JSON.parse(localStorage.getItem(APP_PREFERENCES_KEY)!)).toEqual({
    version: 1,
    panelOpen: false,
    date: "2026-11-08",
    division: "nfl",
    filter: "pinned",
    search: "Seattle",
    paused: true,
  });
  first.unmount();
  const next = renderHook(() => useAppDataState());
  expect(next.result.current).toMatchObject({
    panelOpen: false,
    date: "2026-11-08",
    division: "nfl",
    filter: "pinned",
    search: "Seattle",
    paused: true,
  });
});
it("validates restored fields independently, including impossible dates", () => {
  const storage = {
    getItem: vi.fn().mockReturnValue(
      JSON.stringify({
        version: 1,
        panelOpen: "false",
        date: "2026-02-30",
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

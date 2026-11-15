import { useEffect, useState } from "react";

import type { Division } from "@/shared/types";

import type { ScoreboardSource, SeasonCalendar } from "./types";

const EMPTY: SeasonCalendar = { weeks: [] };

// The calendar only changes between seasons, so it loads once per division
// instead of polling with the scoreboard.
export const useSeasonCalendar = (
  source: ScoreboardSource,
  division: Division,
) => {
  const [state, setState] = useState<{
    division: Division;
    calendar: SeasonCalendar;
    error: boolean;
  }>({ division, calendar: EMPTY, error: false });

  useEffect(() => {
    const request = new AbortController();
    source
      .loadCalendar(division, request.signal)
      .then((calendar) => setState({ division, calendar, error: false }))
      .catch(() => {
        if (!request.signal.aborted) {
          setState({ division, calendar: EMPTY, error: true });
        }
      });

    return () => request.abort();
  }, [source, division]);

  // Never offer another division's weeks while the new calendar loads.
  return state.division === division
    ? { ...state.calendar, error: state.error }
    : { ...EMPTY, error: false };
};

import { useCallback, useEffect, useState } from "react";
import type {
  Division,
  LeagueRow,
  TeamSchedule,
  TeamScheduleSource,
} from "../data/types";

export const useTeamSchedule = (
  source: TeamScheduleSource,
  division: Division,
  enabled: boolean,
) => {
  const [selection, setSelection] = useState<{
    division: Division;
    team: LeagueRow;
  }>();
  const selectedTeam =
    selection?.division === division ? selection.team : undefined;
  const teamId = selectedTeam?.id;
  const key = `${division}:${teamId ?? ""}`;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string;
    data?: TeamSchedule;
    loading: boolean;
    error: boolean;
  }>({ key, loading: false, error: false });
  useEffect(() => setSelection(undefined), [division]);
  const selectTeam = useCallback(
    (team: LeagueRow) => setSelection({ division, team }),
    [division],
  );
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!enabled || !teamId) return;
    let disposed = false;
    let request: AbortController | undefined;
    const load = async () => {
      if (disposed || request) return;
      const controller = new AbortController();
      request = controller;
      const timeout = setTimeout(() => controller.abort(), 15_000);
      setState((previous) => ({
        key,
        data: previous.key === key ? previous.data : undefined,
        loading: true,
        error: false,
      }));
      try {
        const data = await source.load({ division, teamId }, controller.signal);
        if (!disposed) setState({ key, data, loading: false, error: false });
      } catch {
        if (!disposed)
          setState((previous) => ({
            key,
            data: previous.key === key ? previous.data : undefined,
            loading: false,
            error: true,
          }));
      } finally {
        clearTimeout(timeout);
        request = undefined;
      }
    };
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 300_000);
    return () => {
      disposed = true;
      clearInterval(timer);
      request?.abort();
    };
  }, [source, division, teamId, enabled, revision, key]);
  const current =
    state.key === key
      ? state
      : { data: undefined, loading: Boolean(enabled && teamId), error: false };
  return {
    selectedTeam,
    selectTeam,
    data: current.data,
    loading: current.loading,
    error: current.error,
    refresh,
  };
};

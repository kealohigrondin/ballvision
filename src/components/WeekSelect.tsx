import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useMemo } from "react";

import { copy } from "../copy";
import type { Week } from "../data/types";

type WeekSelectProps = {
  weeks: Week[];
  week: Week | null;
  currentWeekId?: string;
  onChange: (week: Week) => void;
};

export const WeekSelect = ({
  weeks,
  week,
  currentWeekId,
  onChange,
}: WeekSelectProps) => {
  // An unselected week follows the provider's current week; ids missing from
  // the loaded calendar render as empty rather than an unknown option.
  const selectedId = useMemo(() => {
    const id = week?.id ?? currentWeekId;

    return weeks.find((option) => option.id === id)?.id ?? "";
  }, [weeks, week, currentWeekId]);

  const items = weeks.flatMap((option, index) => [
    ...(option.group !== weeks[index - 1]?.group
      ? [
          <ListSubheader key={`group-${option.id}`}>
            {option.group}
          </ListSubheader>,
        ]
      : []),
    <MenuItem key={option.id} value={option.id}>
      {option.label}
      {option.detail && ` · ${option.detail}`}
    </MenuItem>,
  ]);

  return (
    <TextField
      select
      id="game-week"
      label={copy.week.label}
      value={selectedId}
      disabled={weeks.length === 0}
      onChange={(event) => {
        const next = weeks.find((option) => option.id === event.target.value);
        if (next) {
          onChange(next);
        }
      }}
      sx={{ minWidth: 180 }}
    >
      {items}
    </TextField>
  );
};

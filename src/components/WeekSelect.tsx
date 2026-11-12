import IconButton from "@mui/material/IconButton";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { copy } from "../copy";
import type { Week } from "../data/types";
import { MASTHEAD_ICON_SIZE } from "./MastHeadIconButton";

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
  const selectedIndex = useMemo(() => {
    const id = week?.id ?? currentWeekId;

    return weeks.findIndex((option) => option.id === id);
  }, [weeks, week, currentWeekId]);
  const selectedId = weeks[selectedIndex]?.id ?? "";

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
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <IconButton
        aria-label={copy.week.previous}
        disabled={selectedIndex <= 0}
        onClick={() => onChange(weeks[selectedIndex - 1])}
      >
        <ChevronLeft size={MASTHEAD_ICON_SIZE} />
      </IconButton>
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
      <IconButton
        aria-label={copy.week.next}
        disabled={selectedIndex < 0 || selectedIndex >= weeks.length - 1}
        onClick={() => onChange(weeks[selectedIndex + 1])}
      >
        <ChevronRight size={MASTHEAD_ICON_SIZE} />
      </IconButton>
    </Stack>
  );
};

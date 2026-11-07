import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { SegmentedControl } from "./SegmentedControl";
import type { Division } from "../data/types";
import { localDate } from "../utils/date";
export type Filter = "all" | "live" | "upcoming" | "final" | "pinned";
type ToolbarProps = {
  date: string;
  onDate: (value: string) => void;
  division: Division;
  onDivision: (v: Division) => void;
  search: string;
  onSearch: (v: string) => void;
  filter: Filter;
  onFilter: (v: Filter) => void;
  counts: Record<Filter, number>;
};

export const Toolbar = ({
  date,
  onDate,
  division,
  onDivision,
  search,
  onSearch,
  filter,
  onFilter,
  counts,
}: ToolbarProps) => {
  const shift = (days: number) => {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + days);
    onDate(localDate(next));
  };
  const filterOptions = (
    ["all", "live", "upcoming", "final", "pinned"] as const
  ).map((f) => {
    const label = {
      all: "All games",
      live: "Live now",
      upcoming: "Upcoming",
      final: "Final",
      pinned: "Pinned",
    }[f];
    return {
      value: f,
      label: (
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <span>{label}</span>
          <span>{counts[f]}</span>
        </Stack>
      ),
    };
  });
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        useFlexGap
        spacing={1}
        sx={{ alignItems: "center", flexWrap: "wrap" }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center" }}
          className="date-control"
        >
          <IconButton aria-label="Previous day" onClick={() => shift(-1)}>
            <ChevronLeft />
          </IconButton>
          <TextField
            id="game-date"
            label="Game date"
            type="date"
            value={date}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { min: "2000-01-01", max: "2099-12-31" },
            }}
            onChange={(e) => {
              if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value))
                onDate(e.target.value);
            }}
          />
          <IconButton aria-label="Next day" onClick={() => shift(1)}>
            <ChevronRight />
          </IconButton>
        </Stack>
        <Button onClick={() => onDate(localDate())}>Today</Button>
        <SegmentedControl
          label="Division"
          value={division}
          options={(["fbs", "fcs", "nfl"] as const).map((value) => ({
            value,
            label: value.toUpperCase(),
          }))}
          onChange={onDivision}
        />
        <TextField
          label="Search teams"
          placeholder="Find your team…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          sx={{ ml: { sm: "auto" }, width: { xs: "100%", sm: "auto" } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Clear search"
                    onClick={() => onSearch("")}
                  >
                    <X />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>
      <Box sx={{ overflowX: "auto" }}>
        <SegmentedControl
          label="Filter games"
          value={filter}
          options={filterOptions}
          onChange={onFilter}
        />
      </Box>
    </Stack>
  );
};

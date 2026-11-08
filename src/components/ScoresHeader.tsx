import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { Search, X } from "lucide-react";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { SegmentedControl } from "./SegmentedControl";
import { WeekSelect } from "./WeekSelect";

type ScoresHeaderProps = Record<string, never>;

export const ScoresHeader = ({}: ScoresHeaderProps) => {
  const {
    week,
    setWeek,
    division,
    setDivision: onDivision,
    search,
    setSearch: onSearch,
    filter,
    setFilter: onFilter,
  } = useAppData();
  const { counts, weeks, currentWeekId } = useEspnData();

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
    <Box
      id="scores-header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        bgcolor: "background.default",
        py: 2,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          useFlexGap
          spacing={1}
          sx={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <WeekSelect
            weeks={weeks}
            week={week}
            currentWeekId={currentWeekId}
            onChange={setWeek}
          />
          <Button onClick={() => setWeek(null)} disabled={week === null}>
            This week
          </Button>
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
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <SegmentedControl
            fullWidth
            label="Filter games"
            value={filter}
            options={filterOptions}
            onChange={onFilter}
          />
        </Box>
      </Stack>
    </Box>
  );
};

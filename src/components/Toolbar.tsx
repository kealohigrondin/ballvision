import { segmentedButtonSx, iconButtonSx } from "../styles/shared";
import { liveDotSx, controlHeightSx, visuallyHiddenSx } from "../styles/shared";
import Box from "@mui/material/Box";
import { SegmentedControl } from "./SegmentedControl";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import clsx from "clsx";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
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
  const divisionButtons = (["fbs", "fcs", "nfl"] as const).map((d) => {
    return (
      <Box
        component="button"
        key={d}
        aria-pressed={division === d}
        className={clsx(division === d && "active")}
        onClick={() => onDivision(d)}
        sx={[
          segmentedButtonSx,
          {
            padding: { xs: "4px", sm: "0 14px" },
            borderRadius: "20px",
            color: "var(--mui-palette-text-secondary)",
          },
        ]}
      >
        {d.toUpperCase()}
      </Box>
    );
  });

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
        <>
          {f === "live" && (
            <Box component="span" className="live-dot" sx={liveDotSx} />
          )}
          {label}
          <Typography
            variant="caption"
            component="span"
            className="count"
            sx={{ color: "var(--mui-app-colors-badgeText)" }}
          >
            {counts[f]}
          </Typography>
        </>
      ),
    };
  });
  return (
    <>
      <Stack
        direction="row"
        className="toolbar"
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          paddingBottom: "20px",
        }}
      >
        <Stack
          direction="row"
          className="date-control"
          sx={[
            controlHeightSx,
            {
              display: "flex",
              alignItems: "center",
              padding: "3px 6px",
              border: "1px solid var(--mui-palette-divider)",
              borderRadius: "24px",
              background: "var(--mui-app-colors-inputSurface)",
              "& input": {
                width: "125px",
                background: "var(--mui-app-colors-transparent)",
                border: "0",
                color: "var(--mui-palette-text-primary)",
              },
              "& input::-webkit-calendar-picker-indicator": { opacity: "0.65" },
            },
          ]}
        >
          <Box
            component="button"
            className="icon-button"
            aria-label="Previous day"
            onClick={() => shift(-1)}
            sx={[
              iconButtonSx,
              {
                background: "transparent",
                color: "var(--mui-palette-text-primary)",
                height: "24px",
                "&:hover": {
                  background: "var(--mui-app-colors-iconHoverSurface)",
                },
              },
            ]}
          >
            <ChevronLeft size={17} />
          </Box>
          <Box
            component="label"
            className="sr-only"
            htmlFor="game-date"
            sx={visuallyHiddenSx}
          >
            Game date
          </Box>
          <input
            id="game-date"
            type="date"
            value={date}
            min="2000-01-01"
            max="2099-12-31"
            onChange={(e) => {
              if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value))
                onDate(e.target.value);
            }}
          />
          <Box
            component="button"
            className="icon-button"
            aria-label="Next day"
            onClick={() => shift(1)}
            sx={[
              iconButtonSx,
              {
                background: "transparent",
                color: "var(--mui-palette-text-primary)",
                height: "24px",
                "&:hover": {
                  background: "var(--mui-app-colors-iconHoverSurface)",
                },
              },
            ]}
          >
            <ChevronRight size={17} />
          </Box>
        </Stack>
        <Box
          component="button"
          className="today-button"
          onClick={() => onDate(localDate())}
          sx={[
            controlHeightSx,
            {
              border: "0",
              padding: "6px 16px",
              borderRadius: "24px",
              background: "var(--mui-app-colors-inputSurface)",
              color: "var(--mui-palette-text-primary)",
              "&:hover": {
                background: "var(--mui-app-colors-buttonHoverSurface)",
              },
              "@media (max-width: 599.95px)": { padding: "4px" },
            },
          ]}
        >
          Today
        </Box>
        <Stack
          direction="row"
          className="division-switch"
          role="group"
          aria-label="Division"
          sx={[
            controlHeightSx,
            {
              display: "flex",
              alignItems: "center",
              padding: "0",
              borderRadius: "24px",
              background: "var(--mui-app-colors-inputSurface)",

              "@media (max-width: 599.95px)": {},
            },
          ]}
        >
          {divisionButtons}
        </Stack>
        <Box
          component="label"
          className="search"
          sx={[
            controlHeightSx,
            {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginLeft: "auto",
              maxWidth: "230px",
              padding: "0 14px",
              borderRadius: "14px",
              background: "var(--mui-app-colors-inputSurface)",
              color: "var(--mui-app-colors-searchIcon)",
              "& input": {
                border: "0",
                background: "var(--mui-app-colors-transparent)",
                color: "var(--mui-palette-text-primary)",
                width: "100%",
                minWidth: "0",
                outline: "0",
              },
              "&:focus-within": {
                outline: "2px solid var(--mui-palette-primary-main)",
              },
              "& input::placeholder": {
                color: "var(--mui-app-colors-placeholder)",
              },

              "@media (max-width: 599.95px)": {
                width: "100%",
                maxWidth: "none",
                marginLeft: "0",
              },
            },
          ]}
        >
          <Search size={16} />
          <Box component="span" className="sr-only" sx={visuallyHiddenSx}>
            Search teams
          </Box>
          <input
            placeholder="Find your team…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <button aria-label="Clear search" onClick={() => onSearch("")}>
              ×
            </button>
          )}
        </Box>
      </Stack>
      <SegmentedControl
        label="Filter games"
        value={filter}
        options={filterOptions}
        onChange={onFilter}
      />
    </>
  );
};

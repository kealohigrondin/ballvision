import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { type PointerEvent, useId, useMemo, useState } from "react";

import { usePolymarketGame } from "../context/polymarketGameContext";
import type { OddsHistory } from "../data/types";
import { useElementWidth } from "../hooks/useElementWidth";
import { americanOdds } from "../utils/odds";
import { withLiveOdds } from "../utils/oddsHistory";
import { historyAt } from "../utils/oddsHistory";

type OddsHistoryChartProps = Record<never, never>;

const timeLabel = (time: number) =>
  new Date(time).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

export const OddsHistoryChart = ({}: OddsHistoryChartProps) => {
  const {
    game,
    quote,
    history: { data },
  } = usePolymarketGame();

  const history = useMemo(
    () => (data && quote ? withLiveOdds(data, quote) : { away: [], home: [] }),
    [data, quote],
  );
  const away = game.away.abbreviation;
  const home = game.home.abbreviation;
  const theme = useTheme();
  const { ref, width: measuredWidth } = useElementWidth();
  const width = Math.max(280, measuredWidth);
  const plotWidth = width - 60;
  const descriptionId = useId();
  const [selected, setSelected] = useState<number | null>(null);

  const times = useMemo(
    () =>
      [
        ...new Set(
          [...history.away, ...history.home].map((point) => point.timestamp),
        ),
      ].sort((a, b) => a - b),
    [history],
  );
  const start = times[0];
  const end = times.at(-1) ?? start;
  const span = Math.max(end - start, 1);
  const index = Math.min(selected ?? times.length - 1, times.length - 1);
  const timestamp = times[index];
  const awayValue = historyAt(history.away, timestamp);
  const homeValue = historyAt(history.home, timestamp);

  const label = (value: number | undefined) =>
    value === undefined
      ? "—"
      : `${(value * 100).toFixed(1)}% (${americanOdds(value)})`;

  const x = (time: number) => 40 + ((time - start) / span) * plotWidth;

  const y = (probability: number) => 160 - probability * 144;

  const path = (points: OddsHistory["away"]) =>
    points
      .map(
        (point, i) =>
          `${i === 0 ? "M" : "L"}${x(point.timestamp)},${y(point.probability)}`,
      )
      .join(" ");
  const grid = [0, 0.25, 0.5, 0.75, 1].map((value) => (
    <g key={value}>
      <line
        x1="40"
        x2={width - 20}
        y1={y(value)}
        y2={y(value)}
        stroke={theme.palette.divider}
      />
      <text x="34" y={y(value) + 4} textAnchor="end">
        {value * 100}%
      </text>
    </g>
  ));
  const ticks = [start, start + span / 2, end].map((time, i) => {
    const anchor = (["start", "middle", "end"] as const)[i];
    const showDate =
      i === 0 &&
      new Date(start).toDateString() !== new Date(end).toDateString();
    const tickLabel = showDate
      ? new Date(time).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : timeLabel(time);
    return (
      <text key={i} x={x(time)} y="184" textAnchor={anchor}>
        {tickLabel}
      </text>
    );
  });

  const inspect = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const coordinate = ((event.clientX - bounds.left) / bounds.width) * width;
    const target =
      start + Math.max(0, Math.min(1, (coordinate - 40) / plotWidth)) * span;
    const closest = times.reduce(
      (best, time, i) =>
        Math.abs(time - target) < Math.abs(times[best] - target) ? i : best,
      0,
    );
    setSelected(closest);
  };
  return (
    <Box component="figure" ref={ref} sx={{ m: 0, minWidth: 0 }}>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ flexWrap: "wrap", mb: 1 }}
      >
        <Typography sx={{ color: "primary.main" }}>
          {away} — {label(awayValue)}
        </Typography>
        <Typography sx={{ color: "secondary.main" }}>
          {home} ⋯ {label(homeValue)}
        </Typography>
      </Stack>
      <Box
        component="svg"
        viewBox={`0 0 ${width} 200`}
        role="img"
        tabIndex={0}
        aria-label={`Polymarket implied win probability history for ${away} and ${home}`}
        aria-describedby={descriptionId}
        sx={{
          display: "block",
          width: "100%",
          height: "auto",
          color: "text.secondary",
          touchAction: "pan-y",
          "& text": {
            fill: "currentColor",
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.caption.fontSize,
          },
          "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }}
        onPointerMove={inspect}
        onPointerDown={inspect}
        onPointerLeave={() => setSelected(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            setSelected(
              Math.max(
                0,
                Math.min(
                  times.length - 1,
                  index + (event.key === "ArrowLeft" ? -1 : 1),
                ),
              ),
            );
          }
          if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            setSelected(event.key === "Home" ? 0 : times.length - 1);
          }
        }}
      >
        <title>
          {away} and {home} implied win probability over time
        </title>
        {grid}
        {ticks}
        <path
          d={path(history.away)}
          fill="none"
          stroke={theme.palette.primary.main}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={path(history.home)}
          fill="none"
          stroke={theme.palette.secondary.main}
          strokeWidth="2"
          strokeDasharray="6 4"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={x(timestamp)}
          x2={x(timestamp)}
          y1="16"
          y2="160"
          stroke={theme.palette.text.secondary}
          strokeDasharray="3 3"
        />
        {awayValue !== undefined && (
          <circle
            cx={x(timestamp)}
            cy={y(awayValue)}
            r="3"
            fill={theme.palette.primary.main}
          />
        )}
        {homeValue !== undefined && (
          <circle
            cx={x(timestamp)}
            cy={y(homeValue)}
            r="3"
            fill={theme.palette.secondary.main}
          />
        )}
      </Box>
    </Box>
  );
};

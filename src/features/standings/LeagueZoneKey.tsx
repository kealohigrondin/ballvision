import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

import type { LeagueZone } from "./types";

type LeagueZoneKeyProps = {
  id: string;
  zones: readonly LeagueZone[];
};

// A key under a table naming what each run of positions earns,
// e.g. "1–4 Champions League · 5 Europa League · 18–20 Relegation".
export const LeagueZoneKey = ({ id, zones }: LeagueZoneKeyProps) => (
  <Box
    component="ul"
    id={id}
    aria-label={copy.league.zones}
    sx={{
      display: "flex",
      flexWrap: "wrap",
      columnGap: 2,
      rowGap: 0.5,
      listStyle: "none",
      m: 0,
      px: 2,
    }}
  >
    {zones.map((zone) => (
      <Typography
        key={zone.first}
        component="li"
        variant="caption"
        color="text.secondary"
      >
        <Box component="span" sx={{ fontWeight: "bold", mr: 0.5 }}>
          {copy.league.zonePositions(zone.first, zone.last)}
        </Box>
        {zone.note}
      </Typography>
    ))}
  </Box>
);

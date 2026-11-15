import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MapPin } from "lucide-react";

type VenueLabelProps = { venue: string };

// Where a game is played: a pin and the stadium name, cut short with an
// ellipsis when it doesn't fit.
export const VenueLabel = ({ venue }: VenueLabelProps) => (
  <Stack
    direction="row"
    spacing={0.5}
    sx={{ alignItems: "center", minWidth: 0 }}
  >
    <MapPin size={14} style={{ flexShrink: 0 }} aria-hidden />
    <Typography component="span" noWrap>
      {venue}
    </Typography>
  </Stack>
);

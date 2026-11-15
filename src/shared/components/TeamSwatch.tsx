import Box from "@mui/material/Box";

import { teamFill } from "@/shared/teamFill";

type TeamSwatchProps = { color: string; hatched?: boolean };

// A small square in a team's stat fill, used as a legend key.
export const TeamSwatch = ({ color, hatched = false }: TeamSwatchProps) => (
  <Box
    aria-hidden
    sx={{
      width: 12,
      height: 12,
      borderRadius: "2px",
      background: teamFill(color, hatched),
    }}
  />
);

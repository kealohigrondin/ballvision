import Box from "@mui/material/Box";

import { useState } from "react";
import type { Team } from "../data/types";

type TeamLogoProps = {
  team: Pick<Team, "logo"> & Partial<Pick<Team, "color" | "abbreviation">>;
};

export const TeamLogo = ({ team }: TeamLogoProps) => {
  const color = team.color ?? "var(--mui-app-teamColorFallback)";
  const [failed, setFailed] = useState(false);
  const logo =
    team.logo && !failed ? (
      <img
        src={team.logo}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    ) : (
      <Box component="span" sx={{ color }}>
        {(team.abbreviation ?? "?").slice(0, 3)}
      </Box>
    );

  return (
    <Box
      component="span"
      className="team-logo"
      sx={{
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        width: "min(50px, 100%)",
        aspectRatio: "1",
        display: "grid",
        placeItems: "center",
        flexShrink: "0",
        borderRadius: "50%",
        "& img": { width: "85%", height: "85%", objectFit: "contain" },
      }}
    >
      {logo}
    </Box>
  );
};

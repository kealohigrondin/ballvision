import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import type { Team } from "../data/types";

type TeamLogoProps = {
  team: Pick<Team, "logo"> & Partial<Pick<Team, "color" | "abbreviation">>;
  size?: number;
};

export const TeamLogo = ({ team, size = 40 }: TeamLogoProps) => {
  const [failed, setFailed] = useState(false);
  const logo =
    team.logo && !failed ? (
      <Box
        component="img"
        src={team.logo}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        sx={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    ) : (
      <Typography component="span">
        {(team.abbreviation ?? "?").slice(0, 3)}
      </Typography>
    );
  return (
    <Box
      component="span"
      className="team-logo"
      sx={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {logo}
    </Box>
  );
};

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { useColorMode } from "../context/ColorModeContext";
import type { Team } from "../data/types";

type TeamLogoProps = {
  team: Pick<Team, "logo"> &
    Partial<Pick<Team, "logoDark" | "color" | "abbreviation">>;
  size?: number;
};

export const TeamLogo = ({ team, size = 40 }: TeamLogoProps) => {
  const { mode } = useColorMode();
  // Remember which image failed so switching themes retries the other one.
  const [failedSrc, setFailedSrc] = useState("");
  const src = mode === "dark" ? (team.logoDark ?? team.logo) : team.logo;
  const logo =
    src && src !== failedSrc ? (
      <Box
        component="img"
        src={src}
        alt=""
        loading="lazy"
        onError={() => setFailedSrc(src)}
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

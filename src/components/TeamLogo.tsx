import "./styles/TeamLogo.css";
import { useState } from "react";
import type { Team } from "../data/types";

type TeamLogoProps = { team: Team };

export const TeamLogo = ({ team }: TeamLogoProps) => {
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
      <span style={{ color: team.color }}>{team.abbreviation.slice(0, 3)}</span>
    );

  return (
    <span className="team-logo" style={{ backgroundColor: `${team.color}20` }}>
      {logo}
    </span>
  );
};

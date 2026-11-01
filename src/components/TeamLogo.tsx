import "./styles/TeamLogo.css";
import { useState } from "react";
import type { Team } from "../data/types";

type TeamLogoProps = {
  team: Pick<Team, "logo"> & Partial<Pick<Team, "color" | "abbreviation">>;
};

export const TeamLogo = ({ team }: TeamLogoProps) => {
  const color = team.color ?? "var(--team-color-fallback)";
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
      <span style={{ color }}>{(team.abbreviation ?? "?").slice(0, 3)}</span>
    );

  return (
    <span
      className="team-logo"
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
      }}
    >
      {logo}
    </span>
  );
};

import Link from "@mui/material/Link";

import { useEspnData } from "../context/espnDataContext";
import type { LeagueRow } from "../data/types";

type TeamScheduleLinkProps = {
  team: Pick<LeagueRow, "id" | "name"> & Partial<LeagueRow>;
  isBold?: boolean;
};

export const TeamScheduleLink = ({
  team,
  isBold = false,
}: TeamScheduleLinkProps) => {
  const {
    schedule: { selectTeam },
  } = useEspnData();

  return (
    <Link
      href="#team-schedule"
      onClick={(event) => {
        event.preventDefault();
        selectTeam({ ...team, record: team.record || "—" });
      }}
      variant="body2"
      sx={{
        overflowWrap: "anywhere",
        textDecoration: "none",
        color: "inherit",
        fontSize: "inherit",
      }}
    >
      <span style={{ fontWeight: isBold ? "bold" : "normal" }}>
        {team.name}
      </span>
    </Link>
  );
};

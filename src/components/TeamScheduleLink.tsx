import Link from "@mui/material/Link";
import { useEspnData } from "../context/espnDataContext";
import type { LeagueRow } from "../data/types";

type TeamScheduleLinkProps = {
  team: Pick<LeagueRow, "id" | "name"> & Partial<LeagueRow>;
};

export const TeamScheduleLink = ({ team }: TeamScheduleLinkProps) => {
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
        fontSize: "0.8rem",
      }}
    >
      {team.name}
    </Link>
  );
};

import Link from "@mui/material/Link";

import { useAppData } from "../context/appDataContext";
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
  const { setPanelOpen } = useAppData();

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setPanelOpen(true);
    selectTeam({ ...team, record: team.record || "—" });
  };

  return (
    <Link
      href="#team-schedule"
      onClick={onClick}
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

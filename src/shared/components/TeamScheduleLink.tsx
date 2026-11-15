import Link from "@mui/material/Link";

import { useAppData } from "@/shared/appData/appDataContext";
import type { TeamRef } from "@/shared/types";

type TeamScheduleLinkProps = {
  team: Pick<TeamRef, "id" | "name"> & Partial<TeamRef>;
  isBold?: boolean;
  abbreviatedName?: boolean;
};

export const TeamScheduleLink = ({
  team,
  isBold = false,
  abbreviatedName = false,
}: TeamScheduleLinkProps) => {
  const { selectTeam, setPanelOpen } = useAppData();

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
        {abbreviatedName ? team.abbreviation || team.name : team.name}
      </span>
    </Link>
  );
};

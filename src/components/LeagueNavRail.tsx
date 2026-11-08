import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { CalendarDays, ListOrdered, Trophy } from "lucide-react";
import type { ReactNode } from "react";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import type { LeagueView } from "../hooks/useLeagueTables";
import { NavRailItem } from "./NavRailItem";

type LeagueNavRailProps = Record<string, never>;

const destinations: { view: LeagueView; label: string; icon: ReactNode }[] = [
  { view: "rankings", label: "Rankings", icon: <Trophy size={20} /> },
  { view: "standings", label: "Standings", icon: <ListOrdered size={20} /> },
  { view: "schedule", label: "Schedules", icon: <CalendarDays size={20} /> },
];

export const LeagueNavRail = ({}: LeagueNavRailProps) => {
  const { division, panelOpen, setPanelOpen } = useAppData();
  const {
    league: { view, setView, setSelectedId },
  } = useEspnData();

  const open = (nextView: LeagueView) => {
    if (panelOpen && view === nextView) {
      setPanelOpen(false);

      return;
    }
    if (view !== nextView) {
      setView(nextView);
      setSelectedId("");
    }
    setPanelOpen(true);
  };

  const items = destinations.map((destination) => (
    <NavRailItem
      key={destination.view}
      icon={destination.icon}
      active={panelOpen && view === destination.view}
      disabled={destination.view === "rankings" && division === "nfl"}
      controls="league-panel"
      onClick={() => open(destination.view)}
    />
  ));

  return (
    <Box
      component="nav"
      aria-label="League navigation"
      sx={{
        gridArea: "rail",
        position: "sticky",
        top: 16,
        mt: 2,
        py: 2,
        zIndex: 2,
        width: 80,
      }}
    >
      <Stack spacing={1.5} sx={{ alignItems: "center" }}>
        {items}
      </Stack>
    </Box>
  );
};

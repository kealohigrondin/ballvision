import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import { CalendarDays, ListOrdered, Trophy } from "lucide-react";
import type { ReactNode } from "react";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { copy } from "../copy";
import { useCompactWindow } from "../hooks/useCompactWindow";
import type { LeagueView } from "../hooks/useLeagueTables";
import { NavRailItem } from "./NavRailItem";

type LeagueNavRailProps = Record<string, never>;

export const leagueNavDestinations: {
  view: LeagueView;
  label: string;
  icon: ReactNode;
}[] = [
  {
    view: "rankings",
    label: copy.navRail.rankings,
    icon: <Trophy size={20} />,
  },
  {
    view: "standings",
    label: copy.navRail.standings,
    icon: <ListOrdered size={20} />,
  },
  {
    view: "schedule",
    label: copy.navRail.schedule,
    icon: <CalendarDays size={20} />,
  },
];

// Medium and wider windows: a vertical navigation rail beside the content.
const railSx: SxProps<Theme> = {
  gridArea: "rail",
  position: "sticky",
  top: 16,
  mt: 2,
  py: 2,
  px: 1,
  zIndex: 2,
  width: 80,
  display: "grid",
  gridAutoFlow: "row",
  rowGap: 1.5,
  justifyItems: "center",
};

// Compact windows: a horizontal navigation bar pinned to the bottom edge,
// with equal-width destinations (Material Design 3 navigation bar).
const barSx: SxProps<Theme> = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: (theme) => theme.zIndex.appBar,
  height: (theme) =>
    `calc(${theme.app.navigationBarHeight}px + env(safe-area-inset-bottom))`,
  pb: "env(safe-area-inset-bottom)",
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "minmax(0, 1fr)",
  alignItems: "center",
  bgcolor: "background.paper",
  borderTop: 1,
  borderColor: "divider",
};

export const LeagueNavRail = ({}: LeagueNavRailProps) => {
  const { division, panelOpen, setPanelOpen } = useAppData();
  const {
    league: { view, setView },
  } = useEspnData();

  const compact = useCompactWindow();

  const open = (nextView: LeagueView) => {
    if (panelOpen && view === nextView) {
      setPanelOpen(false);

      return;
    }
    if (view !== nextView) {
      setView(nextView);
    }
    setPanelOpen(true);
  };

  const items = leagueNavDestinations.map((destination) => (
    <NavRailItem
      key={destination.view}
      label={destination.label}
      icon={destination.icon}
      showLabel={compact}
      active={panelOpen && view === destination.view}
      disabled={destination.view === "rankings" && division === "nfl"}
      controls="league-panel"
      onClick={() => open(destination.view)}
    />
  ));

  return (
    <Box
      component="nav"
      aria-label={copy.navRail.label}
      sx={compact ? barSx : railSx}
    >
      {items}
    </Box>
  );
};

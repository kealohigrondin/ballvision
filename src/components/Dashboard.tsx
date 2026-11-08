import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import clsx from "clsx";

import { useAppData } from "../context/appDataContext";
import { useEspnData } from "../context/espnDataContext";
import { ErrorBanner } from "./ErrorBanner";
import { GameGrid } from "./GameGrid";
import { LeagueNavRail } from "./LeagueNavRail";
import { LeaguePanel } from "./LeaguePanel";
import MastHead from "./MastHead";
import { ScoreNotificationModal } from "./ScoreNotificationModal";
import { ScoresHeader } from "./ScoresHeader";

type DashboardProps = Record<string, never>;

export const Dashboard = ({}: DashboardProps) => {
  const { panelOpen } = useAppData();
  const { error, loading, refresh } = useEspnData();
  const layout = panelOpen
    ? {
        gridTemplateColumns: {
          xs: "72px minmax(0, 1fr)",
          md: "80px 360px minmax(0, 1fr)",
          lg: "80px 380px minmax(0, 1fr)",
        },
        gridTemplateAreas: {
          xs: '"rail panel" "rail main"',
          md: '"rail panel main"',
        },
      }
    : {
        gridTemplateColumns: {
          xs: "72px minmax(0, 1fr)",
          md: "80px minmax(0, 1fr)",
        },
        gridTemplateAreas: '"rail main"',
      };

  return (
    <Box sx={{ pr: 1, py: 1 }} id="root-container">
      <ScoreNotificationModal />
      <MastHead />
      <Box component="main">
        <Box
          className={clsx("dashboard-layout", panelOpen && "panel-open")}
          sx={{
            display: "grid",
            ...layout,
            gap: { xs: 1, lg: 2 },
            alignItems: "start",
          }}
        >
          <LeagueNavRail />
          {panelOpen && <LeaguePanel />}
          <Stack
            className="dashboard-main"
            sx={{ gridArea: "main", minWidth: 0 }}
          >
            <ScoresHeader />
            {error && (
              <ErrorBanner
                message={error}
                loading={loading}
                onRetry={refresh}
              />
            )}
            <GameGrid />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

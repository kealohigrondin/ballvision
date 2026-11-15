import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import clsx from "clsx";

import { ScoreNotificationModal } from "@/features/notifications";
import { GameGrid, ScoresHeader, useScoresData } from "@/features/scores";
import { useAppData } from "@/shared/appData/appDataContext";
import { ErrorBanner } from "@/shared/components/ErrorBanner";
import type { Game } from "@/shared/types";

import { LeagueNavRail } from "./LeagueNavRail";
import { LeaguePanel } from "./LeaguePanel";
import MastHead from "./MastHead";
import { OddsGameCard } from "./OddsGameCard";

type DashboardProps = Record<string, never>;

const renderOddsCard = (game: Game) => <OddsGameCard game={game} />;

export const Dashboard = ({}: DashboardProps) => {
  const theme = useTheme();
  const { panelOpen } = useAppData();
  const { error, loading, refresh } = useScoresData();
  const layout = panelOpen
    ? {
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "80px minmax(0, 1fr)",
          md: "80px 360px minmax(0, 1fr)",
          lg: "80px 380px minmax(0, 1fr)",
        },
        gridTemplateAreas: {
          // Compact windows show the panel as a bottom sheet, outside the grid.
          xs: '"main"',
          sm: '"rail panel" "rail main"',
          md: '"rail panel main"',
        },
      }
    : {
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "80px minmax(0, 1fr)",
        },
        gridTemplateAreas: { xs: '"main"', sm: '"rail main"' },
      };

  return (
    <Box
      sx={{
        pr: 1,
        pl: { xs: 1, sm: 0 },
        pt: 1,
        // Leave room for the fixed bottom navigation bar on compact windows.
        pb: {
          xs: `calc(${theme.app.navigationBarHeight}px + env(safe-area-inset-bottom) + 8px)`,
          sm: 1,
        },
      }}
      id="root-container"
    >
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
            <GameGrid renderCard={renderOddsCard} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

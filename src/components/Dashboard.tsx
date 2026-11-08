import { ScoreCelebrationModal } from "./ScoreCelebrationModal";
import { useEspnData } from "../context/espnDataContext";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import clsx from "clsx";
import { useAppData } from "../context/appDataContext";
import { GameGrid } from "./GameGrid";
import { ErrorBanner } from "./ErrorBanner";
import MastHead from "./MastHead";
import { LeaguePanel } from "./LeaguePanel";
import { ScoresHeader } from "./ScoresHeader";

type DashboardProps = Record<string, never>;

export const Dashboard = ({}: DashboardProps) => {
  const { panelOpen } = useAppData();
  const { error, loading, refresh } = useEspnData();
  const columns = panelOpen
    ? {
        xs: "minmax(0, 1fr)",
        md: "minmax(0, 1fr) 360px",
        lg: "minmax(0, 1fr) 380px",
      }
    : "minmax(0, 1fr)";

  return (
    <Container maxWidth={false} className="app-shell">
      <ScoreCelebrationModal />
      <MastHead />
      <Box component="main">
        <Box
          className={clsx("dashboard-layout", panelOpen && "panel-open")}
          sx={{
            display: "grid",
            gridTemplateColumns: columns,
            gap: { xs: 2.5, lg: 3.5 },
            alignItems: "start",
          }}
        >
          <Stack className="dashboard-main" sx={{ minWidth: 0 }}>
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
          {panelOpen && <LeaguePanel />}
        </Box>
      </Box>
    </Container>
  );
};

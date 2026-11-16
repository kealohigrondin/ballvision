import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { Radio, Settings } from "lucide-react";

import { copy } from "@/copy";
import { EspnFantasyControl, SleeperAccountControl } from "@/features/fantasy";
import { ScoreNotificationControls } from "@/features/notifications";
import { useAppData } from "@/shared/appData/appDataContext";
import { MenuDrawer } from "@/shared/components/MenuDrawer";
import { NavTabs } from "@/shared/components/NavTabs";
import { TOOLBAR_ICON_SIZE } from "@/shared/components/ToolbarIconButton";
import { useCompactWindow } from "@/shared/hooks/useCompactWindow";
import { leagues } from "@/shared/leagues";

import { SyncControls } from "./SyncControls";
import { ThemeToggle } from "./ThemeToggle";

type MastHeadProps = Record<string, never>;

const leagueOptions = leagues.map((league) => ({
  value: league,
  label: copy.mastHead.leagues[league],
}));

const MastHead = ({}: MastHeadProps) => {
  const { league, setLeague } = useAppData();
  const compact = useCompactWindow();
  const actions = compact ? (
    <MenuDrawer
      id="masthead-menu"
      label={copy.mastHead.settings}
      closeLabel={copy.mastHead.closeSettings}
      icon={Settings}
      iconSize={TOOLBAR_ICON_SIZE}
    >
      <SyncControls showLabels />
      <ScoreNotificationControls showLabels />
      <SleeperAccountControl showLabels />
      <EspnFantasyControl showLabels />
      <ThemeToggle showLabels />
    </MenuDrawer>
  ) : (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <SyncControls />
      <ScoreNotificationControls />
      <SleeperAccountControl />
      <EspnFantasyControl />
      <ThemeToggle />
    </Stack>
  );

  // Phones stack the league tabs under the logo and settings; wider windows
  // keep everything on one row, with the tabs beside the logo.
  return (
    <Box
      component="header"
      sx={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr auto" : "auto auto 1fr auto",
        gridTemplateAreas: compact
          ? '"logo actions" "tabs tabs"'
          : '"logo divider tabs actions"',
        alignItems: "center",
        columnGap: 2,
        py: 0.5,
        px: 0.5,
      }}
    >
      <Link
        variant="h5"
        href="./"
        aria-label="BALLVISION home"
        sx={{
          gridArea: "logo",
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Radio />
        {/* Phones show only the logo; the link keeps its accessible name. */}
        <Box
          component="h1"
          sx={{
            fontSize: { xs: "14px", sm: "16px" },
            display: { xs: "inline", sm: "inline" },
          }}
        >
          BALLVISION
        </Box>
      </Link>
      {!compact && (
        <Divider
          orientation="vertical"
          flexItem
          sx={{ gridArea: "divider", my: 1.5 }}
        />
      )}
      <NavTabs
        id="league-tab"
        label={copy.mastHead.leaguesLabel}
        value={league}
        options={leagueOptions}
        onChange={setLeague}
        fullWidth={compact}
        sx={{ gridArea: "tabs", minWidth: 0 }}
      />
      <Box sx={{ gridArea: "actions" }}>{actions}</Box>
    </Box>
  );
};
export default MastHead;

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { Radio, Settings } from "lucide-react";

import { copy } from "../copy";
import { useCompactWindow } from "../hooks/useCompactWindow";
import { MASTHEAD_ICON_SIZE } from "./MastHeadIconButton";
import { MenuDrawer } from "./MenuDrawer";
import { ScoreNotificationControls } from "./ScoreNotificationControls";
import { SyncControls } from "./SyncControls";
import { ThemeToggle } from "./ThemeToggle";

type MastHeadProps = Record<string, never>;

const MastHead = ({}: MastHeadProps) => {
  const compact = useCompactWindow();
  const actions = compact ? (
    <MenuDrawer
      id="masthead-menu"
      label={copy.mastHead.settings}
      closeLabel={copy.mastHead.closeSettings}
      icon={Settings}
      iconSize={MASTHEAD_ICON_SIZE}
    >
      <SyncControls showLabels />
      <ScoreNotificationControls showLabels />
      <ThemeToggle showLabels />
    </MenuDrawer>
  ) : (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <SyncControls />
      <ScoreNotificationControls />
      <ThemeToggle />
    </Stack>
  );

  return (
    <Stack
      component="header"
      direction="row"
      spacing={2}
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.5,
        px: 0.5,
      }}
    >
      <Link
        variant="h5"
        href="./"
        aria-label="BALLVISION home"
        sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
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
      {actions}
    </Stack>
  );
};
export default MastHead;

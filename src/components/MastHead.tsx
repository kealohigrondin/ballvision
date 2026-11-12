import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { Radio } from "lucide-react";

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
  const controls = (
    <>
      <SyncControls />
      <ScoreNotificationControls />
      <ThemeToggle />
    </>
  );
  // Phones tuck the controls into a menu that opens from the right.
  const actions = compact ? (
    <MenuDrawer
      id="masthead-menu"
      label={copy.mastHead.menu}
      closeLabel={copy.mastHead.closeMenu}
      iconSize={MASTHEAD_ICON_SIZE}
    >
      {controls}
    </MenuDrawer>
  ) : (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      {controls}
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
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
          BALLVISION
        </Box>
      </Link>
      {actions}
    </Stack>
  );
};
export default MastHead;

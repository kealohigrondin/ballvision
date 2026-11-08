import { CelebrationControls } from "./CelebrationControls";
import { Radio } from "lucide-react";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { SyncControls } from "./SyncControls";
import { ThemeToggle } from "./ThemeToggle";

type MastHeadProps = Record<string, never>;

const MastHead = ({}: MastHeadProps) => (
  <Stack
    component="header"
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{
      justifyContent: "space-between",
      alignItems: { xs: "start", sm: "center" },
      py: 2,
    }}
  >
    <Link
      variant="h5"
      href="./"
      aria-label="BALLVISION home"
      sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}
    >
      <Radio />
      BALLVISION
    </Link>
    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
      <SyncControls />
      <CelebrationControls />
      <ThemeToggle />
    </Stack>
  </Stack>
);
export default MastHead;

import { Radio } from "lucide-react";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { SyncControls } from "./SyncControls";
import { ThemeToggle } from "./ThemeToggle";

type MastHeadProps = {
  loading: boolean;
  paused: boolean;
  error: string | null;
  updatedAt: Date | null;
  refresh: () => void;
  onTogglePause: () => void;
};

const MastHead = ({
  loading,
  paused,
  error,
  updatedAt,
  refresh,
  onTogglePause,
}: MastHeadProps) => (
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
      <SyncControls
        loading={loading}
        paused={paused}
        error={error}
        updatedAt={updatedAt}
        onTogglePause={onTogglePause}
        onRefresh={refresh}
      />
      <ThemeToggle />
    </Stack>
  </Stack>
);
export default MastHead;

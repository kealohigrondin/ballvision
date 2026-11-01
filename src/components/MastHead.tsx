import "./styles/MastHead.css";
import { Radio } from "lucide-react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
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
}: MastHeadProps) => {
  return (
    <Stack component="header" direction="row" className="masthead">
      <Typography
        variant="h5"
        component="a"
        className="brand"
        href="./"
        aria-label="BALLVISION home"
      >
        <Box component="span" className="brand-mark">
          <Radio size={22} />
        </Box>
        BALL
        <Typography variant="inherit" component="span" className="brand-light">
          VISION
        </Typography>
      </Typography>
      <Stack direction="row" className="masthead-actions">
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
};
export default MastHead;

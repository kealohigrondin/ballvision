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
    <Stack
      component="header"
      direction="row"
      className="masthead"
      sx={{
        minHeight: "64px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        borderBottom: "1px solid var(--mui-palette-divider)",
        "@media (max-width: 599.95px)": { minHeight: "90px" },
      }}
    >
      <Typography
        variant="h5"
        component="a"
        className="brand"
        href="./"
        aria-label="BALLVISION home"
        sx={{ display: "flex", alignItems: "center", gap: "2px" }}
      >
        <Box
          component="span"
          className="brand-mark"
          sx={{
            display: "grid",
            placeItems: "center",
            color: "var(--mui-palette-text-primary)",
            width: "36px",
            height: "36px",
            marginRight: "7px",
            "& svg": { width: "30px", height: "30px" },
            "@media (max-width: 599.95px)": {
              width: "25px",
              marginRight: "5px",
              "& svg": { width: "24px", height: "24px" },
            },
          }}
        >
          <Radio size={22} />
        </Box>
        BALL
        <Typography
          variant="inherit"
          component="span"
          className="brand-light"
          sx={{ color: "var(--mui-palette-text-primary)" }}
        >
          VISION
        </Typography>
      </Typography>
      <Stack
        direction="row"
        className="masthead-actions"
        sx={{ display: "flex", alignItems: "center", gap: "20px" }}
      >
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

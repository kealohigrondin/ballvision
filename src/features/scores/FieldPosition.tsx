import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { copy } from "@/copy";

type FieldPositionProps = {
  id: string;
  /** 0 is the left goal line, 100 the right one. */
  percent: number;
  /** The yard line as read aloud and shown, e.g. "UGA 24". */
  label: string;
};

// A miniature field with a marker where the ball is, and the yard line
// written underneath.
export const FieldPosition = ({ id, percent, label }: FieldPositionProps) => (
  <Stack
    id={id}
    role="img"
    aria-label={copy.gameHeader.ballOn(label)}
    spacing={0.25}
    sx={{ alignItems: "center", width: 64 }}
  >
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 8,
        borderRadius: "2px",
        bgcolor: "action.selected",
        // End zones at both ends.
        backgroundImage: (theme) =>
          `linear-gradient(90deg, ${theme.palette.text.disabled} 0 8%, transparent 8% 92%, ${theme.palette.text.disabled} 92%)`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: `${percent}%`,
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: "primary.main",
          border: 1,
          borderColor: "background.paper",
          transform: "translate(-50%, -50%)",
        }}
      />
    </Box>
    <Typography
      component="span"
      variant="caption"
      aria-hidden
      sx={{ whiteSpace: "nowrap", lineHeight: 1.2 }}
    >
      {label}
    </Typography>
  </Stack>
);

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useScoreNotification } from "../context/scoreNotificationContext";

type ScoreAlertTimeProps = Record<string, never>;

export const ScoreAlertTime = ({}: ScoreAlertTimeProps) => {
  const { current } = useScoreNotification();
  if (!current) {
    return null;
  }
  const { game } = current;
  const period = game.period > 4 ? `${game.period - 4}OT` : `Q${game.period}`;
  const label = game.period > 0 ? period : game.status;

  return (
    <Stack
      role="group"
      aria-label="Game clock and period"
      spacing={1}
      sx={{ alignItems: "center", flexShrink: 0, textAlign: "center" }}
    >
      <Typography variant="overline">{label}</Typography>
      <Typography variant="h6" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {game.clock || "—"}
      </Typography>
    </Stack>
  );
};

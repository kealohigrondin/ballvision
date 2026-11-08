import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useScoreNotification } from "../context/scoreNotificationContext";
import { copy } from "../copy";
import { periodLabel } from "../utils/gameTime";

type ScoreAlertTimeProps = Record<string, never>;
export const ScoreAlertTime = ({}: ScoreAlertTimeProps) => {
  const { current } = useScoreNotification();
  if (!current) return null;
  const { game } = current;
  const label = game.period > 0 ? periodLabel(game.period) : game.status;
  return (
    <Stack
      role="group"
      aria-label={copy.scoreNotification.clock}
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

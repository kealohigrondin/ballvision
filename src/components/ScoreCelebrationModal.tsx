import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useScoreCelebration } from "../context/scoreCelebrationContext";
import {
  celebrationHeadline,
  CELEBRATION_DURATION_MS,
} from "../utils/scoreCelebrations";
import { CelebrationControls } from "./CelebrationControls";
import { ScoreChalkCircle } from "./ScoreChalkCircle";
import { TeamLogo } from "./TeamLogo";

type ScoreCelebrationModalProps = Record<string, never>;
export const ScoreCelebrationModal = ({}: ScoreCelebrationModalProps) => {
  const { current, pending, dismiss, dismissAll } = useScoreCelebration();
  if (!current) return null;
  const eventLabel = current.preview
    ? "PREVIEW · CURRENT SCORE"
    : "LIVE SCORE DETECTED";
  const teams = [current.game.away, current.game.home].map((team) => {
    const scoring = current.scoringTeamIds.includes(team.id);
    const scoreColor = scoring ? "warning.main" : "text.primary";
    const scoreWeight = scoring ? "fontWeightBold" : "fontWeightRegular";
    return (
      <Stack
        key={team.id}
        spacing={1}
        sx={{ alignItems: "center", flex: 1, minWidth: 0 }}
      >
        <TeamLogo team={team} size={64} />
        <Typography variant="h6" sx={{ textAlign: "center" }}>
          {team.name}
        </Typography>
        <Box sx={{ position: "relative", px: 3, py: 1 }}>
          <Typography
            component="div"
            sx={{
              typography: { xs: "h2", sm: "h1" },
              fontVariantNumeric: "tabular-nums",
              fontWeight: { xs: scoreWeight, sm: scoreWeight },
              color: scoreColor,
            }}
          >
            {team.score}
          </Typography>
          {scoring && <ScoreChalkCircle />}
        </Box>
      </Stack>
    );
  });
  return (
    <Dialog
      open
      onClose={dismiss}
      fullWidth
      maxWidth="lg"
      aria-labelledby="score-chaos-title"
      aria-describedby="score-chaos-description"
      slotProps={{
        paper: {
          sx: (theme) => ({
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(140deg, ${current.game.away.color}, ${theme.palette.background.paper} 45%, ${current.game.home.color})`,
            opacity: 1,
            border: 2,
            borderColor: "warning.main",
          }),
        },
      }}
    >
      <DialogContent
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          py: { xs: 3, sm: 5 },
        }}
      >
        <Typography variant="overline" color="warning.main">
          🚨 {eventLabel} 🚨
        </Typography>
        <Typography
          id="score-chaos-title"
          component="h2"
          sx={{
            typography: { xs: "h4", sm: "h2" },
            my: 2,
            fontWeight: "fontWeightBold",
          }}
        >
          {celebrationHeadline(current)}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", my: 3 }}>
          {teams}
        </Stack>
        <Typography
          id="score-chaos-description"
          variant="body2"
          color="text.secondary"
        >
          {current.game.away.abbreviation} {current.game.away.score} —{" "}
          {current.game.home.abbreviation} {current.game.home.score}. {pending}{" "}
          more score celebrations queued. Auto-dismisses after{" "}
          {CELEBRATION_DURATION_MS / 1000} seconds.
        </Typography>
      </DialogContent>
      <DialogActions
        sx={{
          position: "relative",
          zIndex: 1,
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "center",
          pb: 2,
        }}
      >
        <CelebrationControls />
        <Button onClick={dismissAll}>I have seen enough</Button>
        <Button variant="contained" onClick={dismiss}>
          LET ME WATCH 😭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

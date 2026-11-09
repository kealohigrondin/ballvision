import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MapPin } from "lucide-react";
type GameSummaryProps = {
  venue?: string;
};

export const GameSummary = ({ venue }: GameSummaryProps) => {
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
      <MapPin size={14} />
      <Typography>{venue}</Typography>
    </Stack>
  );
};

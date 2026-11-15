import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { splitStatLine } from "./statLine";

type AthleteStatRowProps = {
  id: string;
  name: string;
  /** Secondary text under the name, e.g. position, number and team. */
  detail?: string;
  /** Stat summary; its numbers are emphasized, e.g. "8/9, 60 YDS". */
  stats: string;
  photo?: string;
  /** "end" mirrors the row: photo on the right, text aligned right. */
  align?: "start" | "end";
};

// One player in a stat list: their photo, name, details and a stat line
// with the numbers in bold. Can be mirrored for the right-hand team.
export const AthleteStatRow = ({
  id,
  name,
  detail = "",
  stats,
  photo = "",
  align = "start",
}: AthleteStatRowProps) => {
  const statParts = splitStatLine(stats).map((part, index) => (
    <Typography
      key={index}
      component="span"
      variant="body2"
      sx={{ fontWeight: part.value ? 700 : 400 }}
    >
      {part.text}
    </Typography>
  ));

  return (
    <Stack
      id={id}
      direction={align === "end" ? "row-reverse" : "row"}
      spacing={1}
      sx={{ alignItems: "center", minWidth: 0 }}
    >
      <Avatar
        src={photo || undefined}
        alt=""
        slotProps={{ img: { loading: "lazy", width: 36, height: 36 } }}
        sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: "action.hover" }}
      />
      <Stack
        sx={{ minWidth: 0, textAlign: align === "end" ? "right" : "left" }}
      >
        <Typography component="span" noWrap sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          noWrap
        >
          {detail}
        </Typography>
        <Typography
          component="span"
          variant="body2"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {statParts}
        </Typography>
      </Stack>
    </Stack>
  );
};

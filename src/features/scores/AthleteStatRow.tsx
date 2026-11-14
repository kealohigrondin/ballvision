import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { splitStatLine } from "./statLine";

type AthleteStatRowProps = {
  id: string;
  /** Short category label shown before the photo, e.g. "PASS". */
  label: string;
  name: string;
  /** Secondary text after the name, e.g. position, number and team. */
  detail?: string;
  /** Stat summary; its numbers are emphasized, e.g. "8/9, 60 YDS". */
  stats: string;
  photo?: string;
};

// One player in a stat list: a category label, their photo, name, details
// and a stat line with the numbers in bold.
export const AthleteStatRow = ({
  id,
  label,
  name,
  detail = "",
  stats,
  photo = "",
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
      component="li"
      id={id}
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "center", minWidth: 0 }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ width: "4ch", flexShrink: 0 }}
      >
        {label}
      </Typography>
      <Avatar
        src={photo || undefined}
        alt=""
        slotProps={{ img: { loading: "lazy", width: 40, height: 40 } }}
        sx={{ width: 40, height: 40, bgcolor: "action.hover" }}
      />
      <Stack sx={{ minWidth: 0 }}>
        <Typography component="span" noWrap>
          {name}{" "}
          <Typography component="span" variant="body2" color="text.secondary">
            {detail}
          </Typography>
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

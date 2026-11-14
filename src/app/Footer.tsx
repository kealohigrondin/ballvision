import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type FooterProps = Record<string, never>;

export const Footer = ({}: FooterProps) => (
  <Stack
    component="footer"
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{ mt: 4, py: 3 }}
  >
    <Typography>BALLVISION</Typography>
    <Typography color="text.secondary">
      Data from ESPN · Refreshes every 20s · Clocks reflect the latest feed
      update
    </Typography>
  </Stack>
);

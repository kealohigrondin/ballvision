import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import "./styles/Footer.css";

type FooterProps = Record<string, never>;

export const Footer = ({}: FooterProps) => {
  return (
    <Stack component="footer" direction={{ xs: "column", sm: "row" }}>
      <Typography variant="caption" component="span" className="footer-brand">
        BALL<span>VISION</span>
      </Typography>
      <Typography variant="caption" component="span">
        Data from ESPN · Refreshes every 20s · Clocks reflect the latest feed
        update
      </Typography>
    </Stack>
  );
};

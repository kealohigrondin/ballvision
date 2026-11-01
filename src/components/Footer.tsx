import Stack from "@mui/material/Stack";
import "./styles/Footer.css";

export const Footer = () => {
  return (
    <Stack component="footer" direction={{ xs: "column", sm: "row" }}>
      <span className="footer-brand">
        BALL<span>VISION</span>
      </span>
      <p>
        Data from ESPN · Refreshes every 20s · Clocks reflect the latest feed
        update
      </p>
      <span>Independent project. Not affiliated with ESPN.</span>
    </Stack>
  );
};

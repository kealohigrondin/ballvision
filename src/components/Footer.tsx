import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

type FooterProps = Record<string, never>;

export const Footer = ({}: FooterProps) => {
  return (
    <Stack
      component="footer"
      direction={{ xs: "column", sm: "row" }}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: { xs: "start", sm: "center" },
        gap: "12px 24px",
        marginTop: "40px",
        padding: "24px 0 32px",
        color: "var(--mui-app-colors-footerMuted)",
        borderTop: "1px solid var(--mui-palette-divider)",
      }}
    >
      <Typography
        variant="caption"
        component="span"
        className="footer-brand"
        sx={{
          color: "var(--mui-app-colors-footerBrand)",
          "& span": { color: "var(--mui-app-colors-footerMuted)" },
        }}
      >
        BALL<span>VISION</span>
      </Typography>
      <Typography variant="caption" component="span">
        Data from ESPN · Refreshes every 20s · Clocks reflect the latest feed
        update
      </Typography>
    </Stack>
  );
};

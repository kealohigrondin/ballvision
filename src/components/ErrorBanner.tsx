import Stack from "@mui/material/Stack";

import { ArrowUpRight, WifiOff } from "lucide-react";

type ErrorBannerProps = {
  message: string;
  loading: boolean;
  onRetry: () => void;
};

export const ErrorBanner = ({
  message,
  loading,
  onRetry,
}: ErrorBannerProps) => (
  <Stack
    direction="row"
    className="error-banner"
    role="alert"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "15px 18px",
      marginTop: "18px",
      background: "var(--mui-app-colors-warningSurface)",
      color: "var(--mui-app-colors-warningText)",
      border: "1px solid var(--mui-app-colors-warningBorder)",
      borderRadius: "16px",
      "& > svg": { flexShrink: "0" },
      "& button": {
        display: "flex",
        alignItems: "center",
        gap: "5px",
        marginLeft: "auto",
        whiteSpace: "nowrap",
        border: "0",
        background: "var(--mui-app-colors-transparent)",
        color: "inherit",
      },
      "@media (max-width: 599.95px)": { flexWrap: "wrap" },
    }}
  >
    <WifiOff size={17} />
    <span>{message}</span>
    <button onClick={onRetry} disabled={loading}>
      Try again <ArrowUpRight size={14} />
    </button>
  </Stack>
);

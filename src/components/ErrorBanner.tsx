import Stack from "@mui/material/Stack";
import "./styles/ErrorBanner.css";
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
  <Stack direction="row" className="error-banner" role="alert">
    <WifiOff size={17} />
    <span>{message}</span>
    <button onClick={onRetry} disabled={loading}>
      Try again <ArrowUpRight size={14} />
    </button>
  </Stack>
);

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { copy } from "../copy";

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
  <Alert
    severity="warning"
    sx={{ my: 2 }}
    action={
      <Button color="inherit" onClick={onRetry} disabled={loading}>
        {copy.common.tryAgain}
      </Button>
    }
  >
    {message}
  </Alert>
);

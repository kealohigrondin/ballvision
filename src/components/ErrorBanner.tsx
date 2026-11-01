import './styles/ErrorBanner.css';
import { ArrowUpRight, WifiOff } from "lucide-react";

export const ErrorBanner = ({
  message,
  loading,
  onRetry,
}: {
  message: string;
  loading: boolean;
  onRetry: () => void;
}) => (
  <div className="error-banner" role="alert">
    <WifiOff size={17} />
    <span>{message}</span>
    <button onClick={onRetry} disabled={loading}>
      Try again <ArrowUpRight size={14} />
    </button>
  </div>
);

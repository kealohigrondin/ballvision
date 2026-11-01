import { CirclePause, CirclePlay, RefreshCw, WifiOff } from 'lucide-react';

interface SyncControlsProps {
  loading: boolean;
  paused: boolean;
  error: string | null;
  updatedAt: Date | null;
  onTogglePause: () => void;
  onRefresh: () => void;
}

export const SyncControls = ({ loading, paused, error, updatedAt, onTogglePause, onRefresh }: SyncControlsProps) => {
  const statusClass = ['sync-status', error && 'has-error'].filter(Boolean).join(' ');
  const dotClass = ['sync-dot', paused && 'paused'].filter(Boolean).join(' ');
  const indicator = error ? <WifiOff size={13} /> : <span className={dotClass} />;
  const pauseLabel = paused ? 'Resume auto-refresh' : 'Pause auto-refresh';
  const pauseIcon = paused ? <CirclePlay size={17} /> : <CirclePause size={17} />;
  const refreshClass = ['icon-button', loading && 'spinning'].filter(Boolean).join(' ');
  const time = updatedAt?.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  const status = loading ? 'Updating…' : paused ? 'Auto-refresh paused' : time ? `Updated ${time}` : 'Connecting…';

  return <div className="sync-controls">
    <span className={statusClass} role="status">{indicator}{status}</span>
    <button className="icon-button" title={pauseLabel} aria-label={pauseLabel} onClick={onTogglePause}>{pauseIcon}</button>
    <button className={refreshClass} aria-label="Refresh scores" title="Refresh scores" onClick={onRefresh} disabled={loading}><RefreshCw size={16} /></button>
  </div>;
};

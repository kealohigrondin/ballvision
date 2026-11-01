import { ChevronDown, MapPin } from 'lucide-react';
import type { Game } from '../data/types';
import { PeriodScores } from './PeriodScores';

export const GameDetails = ({ game }: { game: Game }) => {
  const lastPlay = game.lastPlay ? <p><strong>Last play</strong>{game.lastPlay}</p> : null;
  const hasTimeouts = game.state === 'live' && (game.homeTimeouts !== undefined || game.awayTimeouts !== undefined);
  const timeouts = hasTimeouts
    ? <p className="timeout-detail">Timeouts: {game.away.abbreviation} {game.awayTimeouts ?? '—'} · {game.home.abbreviation} {game.homeTimeouts ?? '—'}</p> : null;
  const venue = game.venue ? <div className="venue"><MapPin size={13} />{game.venue}</div> : null;
  const hasDetails = game.lastPlay || game.home.quarters.length || game.away.quarters.length || game.venue || hasTimeouts;
  const fallback = hasDetails ? null : <p>Additional details are not available yet.</p>;

  return <details className="game-details">
    <summary>Game details <ChevronDown size={14} /></summary>
    {lastPlay}
    <PeriodScores home={game.home} away={game.away} />
    {timeouts}{venue}{fallback}
  </details>;
};

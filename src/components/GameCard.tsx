import { Star, Tv } from 'lucide-react';
import type { Game } from '../data/types';
import { gameTime, kickoff } from '../utils/gameTime';
import { GameDetails } from './GameDetails';
import { TeamRow } from './TeamRow';

export const GameCard = ({ game, favorite, onFavorite }: {
  game: Game; favorite: boolean; onFavorite: () => void;
}) => {
  const live = game.state === 'live';
  const scheduled = game.state === 'upcoming';
  const redZone = game.redZone && live;
  const className = ['game-card', live && 'is-live', redZone && 'red-zone'].filter(Boolean).join(' ');
  const favoriteClass = ['icon-button favorite', favorite && 'selected'].filter(Boolean).join(' ');
  const favoriteTitle = favorite ? 'Unpin game' : 'Pin game';
  const favoriteLabel = `${favorite ? 'Unpin' : 'Pin'} ${game.away.name} at ${game.home.name}`;
  const starFill = favorite ? 'currentColor' : 'none';
  const indicator = live ? <span className="live-dot" /> : null;
  const time = scheduled ? kickoff(game.start) : gameTime(game);
  const redZoneLabel = redZone ? <span className="red-zone-label">RED ZONE · </span> : null;
  const situation = live ? game.situation || 'Game in progress' : game.state === 'final' ? 'Final score' : 'Kickoff';
  const broadcast = game.broadcast ? <span className="broadcast"><Tv size={12} />{game.broadcast}</span> : null;

  return <article className={className}>
    <div className="card-header">
      <span className={`game-state ${game.state}`}>{indicator}{time}</span>
      <button className={favoriteClass} onClick={onFavorite} title={favoriteTitle} aria-label={favoriteLabel} aria-pressed={favorite}>
        <Star size={16} fill={starFill} />
      </button>
    </div>
    <div className="matchup">
      <TeamRow team={game.away} possession={live && game.possession === game.away.id} scheduled={scheduled} />
      <TeamRow team={game.home} possession={live && game.possession === game.home.id} scheduled={scheduled} />
    </div>
    <div className="card-situation"><span>{redZoneLabel}{situation}</span>{broadcast}</div>
    <GameDetails game={game} />
  </article>;
};

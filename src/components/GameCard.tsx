import { useState } from 'react';
import { ChevronDown, MapPin, Radio, Star, Tv } from 'lucide-react';
import type { Game, Team } from '../data/types';

function TeamLogo({ team }: { team: Team }) {
  const [failed, setFailed] = useState(false);
  return <span className="team-logo" style={{ backgroundColor: `${team.color}20` }}>
    {team.logo && !failed ? <img src={team.logo} alt="" loading="lazy" onError={() => setFailed(true)} />
      : <span style={{ color: team.color }}>{team.abbreviation.slice(0, 3)}</span>}
  </span>;
}
export function TeamRow({ team, possession, scheduled }: { team: Team; possession: boolean; scheduled: boolean }) {
  return <div className="team-row">
    <TeamLogo team={team} />
    <div className="team-info"><div className="team-name">{team.rank && <span className="rank">{team.rank}</span>}{team.name}
      {possession && <span className="possession" title="Possession" aria-label="Possession">◆</span>}</div>
      <span className="record">{team.record || team.abbreviation}</span></div>
    <span className="score">{scheduled ? '—' : team.score}</span>
  </div>;
}
export function gameTime(game: Game) {
  if (game.state !== 'live') return game.status;
  if (/half|delay|suspend|end/i.test(game.status)) return game.status;
  if (game.period > 4) return game.period === 5 ? 'OVERTIME' : `${game.period - 4}OT`;
  return `Q${game.period} · ${game.clock || '—'}`;
}
function kickoff(start: string) {
  const date = new Date(start);
  return Number.isNaN(date.getTime()) ? 'Time TBD' : new Intl.DateTimeFormat(undefined,
    { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(date);
}
export function GameCard({ game: g, favorite, onFavorite }: {
  game: Game; favorite: boolean; onFavorite: () => void;
}) {
  return <article className={`game-card ${g.state === 'live' ? 'is-live' : ''} ${g.redZone && g.state === 'live' ? 'red-zone' : ''}`}>
    <div className="card-header"><span className={`game-state ${g.state}`}>
      {g.state === 'live' && <span className="live-dot" />}
      {g.state === 'upcoming' ? kickoff(g.start) : gameTime(g)}
    </span>
      <button className={`icon-button favorite ${favorite ? 'selected' : ''}`} onClick={onFavorite}
        title={favorite ? 'Unpin game' : 'Pin game'} aria-label={`${favorite ? 'Unpin' : 'Pin'} ${g.away.name} at ${g.home.name}`} aria-pressed={favorite}>
        <Star size={16} fill={favorite ? 'currentColor' : 'none'} /></button>
    </div>
    <div className="matchup">
      <TeamRow team={g.away} possession={g.state === 'live' && g.possession === g.away.id} scheduled={g.state === 'upcoming'} />
      <TeamRow team={g.home} possession={g.state === 'live' && g.possession === g.home.id} scheduled={g.state === 'upcoming'} />
    </div>
    <div className="card-situation">
      <span>{g.redZone && g.state === 'live' ? <span className="red-zone-label">RED ZONE · </span> : null}
        {g.state === 'live' ? g.situation || 'Game in progress' : g.state === 'final' ? 'Final score' : 'Kickoff'}
      </span>
      {g.broadcast && <span className="broadcast"><Tv size={12} />{g.broadcast}</span>}
    </div>
    <details className="game-details"><summary>Game details <ChevronDown size={14} /></summary>
      {g.lastPlay && <p><strong>Last play</strong>{g.lastPlay}</p>}
      {(g.home.quarters.length > 0 || g.away.quarters.length > 0) && <div className="table-scroll"><table>
        <caption className="sr-only">Score by period</caption>
        <thead><tr><th>Team</th>{Array.from({ length: Math.max(g.home.quarters.length, g.away.quarters.length) }, (_, i) => <th key={i}>{i < 4 ? i + 1 : `${i - 3}OT`}</th>)}<th>T</th></tr></thead>
        <tbody>{[g.away, g.home].map(t => <tr key={t.id}><th>{t.abbreviation}</th>{Array.from({ length: Math.max(g.home.quarters.length, g.away.quarters.length) }, (_, i) => <td key={i}>{t.quarters[i] ?? '—'}</td>)}<td>{t.score}</td></tr>)}</tbody>
      </table></div>}
      {g.state === 'live' && (g.homeTimeouts !== undefined || g.awayTimeouts !== undefined) && <p className="timeout-detail">Timeouts: {g.away.abbreviation} {g.awayTimeouts ?? '—'} · {g.home.abbreviation} {g.homeTimeouts ?? '—'}</p>}
      {g.venue && <div className="venue"><MapPin size={13} />{g.venue}</div>}
      {!g.lastPlay && g.home.quarters.length === 0 && g.away.quarters.length === 0 && !g.venue && <p>Additional details are not available yet.</p>}
    </details>
  </article>;
}
export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="empty-state"><Radio size={30} /><h2>{title}</h2><p>{detail}</p></div>;
}

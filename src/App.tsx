import { useState } from 'react';
import { ArrowUpRight, CirclePause, CirclePlay, RefreshCw, Radio, WifiOff } from 'lucide-react';
import { espnSource } from './data/espn';
import type { Division, ScoreboardSource } from './data/types';
import { useScoreboard } from './hooks/useScoreboard';
import { useFavorites } from './hooks/useFavorites';
import { EmptyState, GameCard } from './components/GameCard';
import { localDate, Toolbar, type Filter } from './components/Toolbar';

export default function App({ source = espnSource }: { source?: ScoreboardSource }) {
  const [date, setDate] = useState(localDate);
  const [division, setDivision] = useState<Division>('fbs');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [paused, setPaused] = useState(false);
  const { games, loading, error, updatedAt, refresh } = useScoreboard(source, { date, division }, paused);
  const favorites = useFavorites();
  const pinned = (id: string) => favorites.ids.includes(id);
  const counts = { all: games.length, live: games.filter(g => g.state === 'live').length,
    upcoming: games.filter(g => g.state === 'upcoming').length, final: games.filter(g => g.state === 'final').length,
    pinned: games.filter(g => pinned(g.id)).length };
  const visible = games.filter(g => (filter === 'all' || (filter === 'pinned' ? pinned(g.id) : g.state === filter)) &&
    `${g.home.name} ${g.home.abbreviation} ${g.away.name} ${g.away.abbreviation}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(pinned(b.id)) - Number(pinned(a.id)));
  const day = new Date(`${date}T12:00:00`);
  const dayLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(day);
  return <div className="app-shell">
    <header className="masthead"><a className="brand" href="./" aria-label="Saturday Scoreboard home"><span className="brand-mark"><Radio size={22} /></span>SATURDAY<span className="brand-light">SCOREBOARD</span></a>
      <span className="edition">COLLEGE FOOTBALL / {division.toUpperCase()}</span>
    </header>
    <main>
      <section className="hero"><div><div className="eyebrow"><span className="small-line" /> YOUR GAMEDAY HEADQUARTERS</div>
        <h1>Every game.<br /><span>One place.</span></h1>
        <p>Keep an eye on the whole field.</p></div>
        <div className="live-summary"><span className="summary-icon"><Radio size={24} /></span><div className="summary-number">{updatedAt ? String(counts.live).padStart(2, '0') : '—'}</div><div className="summary-label">GAMES LIVE NOW</div><span className="summary-division">{division.toUpperCase()} · {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>
      </section>
      <div className="section-heading"><div><span className="eyebrow">THE SCOREBOARD</span><h2>{dayLabel}<span className="year"> {day.getFullYear()}</span></h2></div>
        <div className="sync-controls"><span className={`sync-status ${error ? 'has-error' : ''}`} role="status">{error ? <WifiOff size={13} /> : <span className={`sync-dot ${paused ? 'paused' : ''}`} />}
          {loading ? 'Updating…' : paused ? 'Auto-refresh paused' : updatedAt ? `Updated ${updatedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' })}` : 'Connecting…'}</span>
          <button className="icon-button" title={paused ? 'Resume auto-refresh' : 'Pause auto-refresh'} aria-label={paused ? 'Resume auto-refresh' : 'Pause auto-refresh'} onClick={() => setPaused(p => !p)}>{paused ? <CirclePlay size={17} /> : <CirclePause size={17} />}</button>
          <button className={`icon-button ${loading ? 'spinning' : ''}`} aria-label="Refresh scores" title="Refresh scores" onClick={refresh} disabled={loading}><RefreshCw size={16} /></button>
        </div>
      </div>
      <Toolbar date={date} onDate={setDate} division={division} onDivision={setDivision} search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} counts={counts} />
      {error && <div className="error-banner" role="alert"><WifiOff size={17} /><span>{error}</span><button onClick={refresh} disabled={loading}>Try again <ArrowUpRight size={14} /></button></div>}
      <div className="results-heading"><span>{filter === 'pinned' ? 'YOUR WATCHLIST' : filter === 'live' ? 'ON THE FIELD' : 'AROUND THE LEAGUE'}</span><span>{visible.length} {visible.length === 1 ? 'game' : 'games'}{search ? ` matching “${search}”` : ''}</span></div>
      {loading && !updatedAt ? <div className="game-grid" aria-label="Loading scores" aria-busy="true">{[0, 1, 2, 3, 4, 5].map(i => <div className="skeleton" key={i}><div /><div /><div /></div>)}</div>
        : visible.length ? <section className="game-grid" aria-label="College football games">{visible.map(g => <GameCard key={g.id} game={g} favorite={pinned(g.id)} onFavorite={() => favorites.toggle(g.id)} />)}</section>
        : <EmptyState title={error && !updatedAt ? 'The feed is taking a timeout.' : filter === 'pinned' ? 'Your watchlist starts here.' : 'No games on this field.'}
          detail={error && !updatedAt ? 'Try refreshing to reconnect to ESPN.' : filter === 'pinned' ? 'Use the star on a game to pin it to the top of your scoreboard.' : 'Try another date, division, or filter.'} />}
      <footer><span className="footer-brand">SATURDAY<span> SCOREBOARD</span></span><p>Data from ESPN · Refreshes every 20s · Clocks reflect the latest feed update</p><span>Independent project. Not affiliated with ESPN.</span></footer>
    </main>
  </div>;
}

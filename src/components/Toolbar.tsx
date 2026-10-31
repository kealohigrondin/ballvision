import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { Division } from '../data/types';
export type Filter = 'all' | 'live' | 'upcoming' | 'final' | 'pinned';
export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function Toolbar({ date, onDate, division, onDivision, search, onSearch, filter, onFilter, counts }: {
  date: string; onDate: (value: string) => void; division: Division; onDivision: (v: Division) => void;
  search: string; onSearch: (v: string) => void; filter: Filter; onFilter: (v: Filter) => void;
  counts: Record<Filter, number>;
}) {
  const shift = (days: number) => {
    const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + days); onDate(localDate(next));
  };
  return <>
    <div className="toolbar">
      <div className="date-control"><button className="icon-button" aria-label="Previous day" onClick={() => shift(-1)}><ChevronLeft size={17} /></button>
        <label className="sr-only" htmlFor="game-date">Game date</label>
        <input id="game-date" type="date" value={date} min="2000-01-01" max="2099-12-31" onChange={e => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) onDate(e.target.value); }} />
        <button className="icon-button" aria-label="Next day" onClick={() => shift(1)}><ChevronRight size={17} /></button>
      </div>
      <button className="today-button" onClick={() => onDate(localDate())}>Today</button>
      <div className="division-switch" role="group" aria-label="Division">{(['fbs', 'fcs'] as const).map(d =>
        <button key={d} aria-pressed={division === d} className={division === d ? 'active' : ''} onClick={() => onDivision(d)}>{d.toUpperCase()}</button>)}</div>
      <label className="search"><Search size={16} /><span className="sr-only">Search teams</span><input placeholder="Find your team…" value={search} onChange={e => onSearch(e.target.value)} />{search && <button aria-label="Clear search" onClick={() => onSearch('')}>×</button>}</label>
    </div>
    <nav className="filter-bar" aria-label="Filter games">{(['all', 'live', 'upcoming', 'final', 'pinned'] as const).map(f =>
      <button key={f} className={filter === f ? 'active' : ''} aria-pressed={filter === f} onClick={() => onFilter(f)}>
        {f === 'live' && <span className="live-dot" />}{({ all: 'All games', live: 'Live now', upcoming: 'Upcoming', final: 'Final', pinned: 'Pinned' })[f]}
        <span className="count">{counts[f]}</span>
      </button>)}</nav>
  </>;
}

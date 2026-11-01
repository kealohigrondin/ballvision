import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { Division } from '../data/types';
import { localDate } from '../utils/date';
export type Filter = 'all' | 'live' | 'upcoming' | 'final' | 'pinned';
export const Toolbar = ({ date, onDate, division, onDivision, search, onSearch, filter, onFilter, counts }: {
  date: string; onDate: (value: string) => void; division: Division; onDivision: (v: Division) => void;
  search: string; onSearch: (v: string) => void; filter: Filter; onFilter: (v: Filter) => void;
  counts: Record<Filter, number>;
}) => {
  const shift = (days: number) => {
    const next = new Date(`${date}T12:00:00`); next.setDate(next.getDate() + days); onDate(localDate(next));
  };
  const divisionButtons = (['fbs', 'fcs'] as const).map(d => {
    const className = division === d ? 'active' : '';
    return <button key={d} aria-pressed={division === d} className={className} onClick={() => onDivision(d)}>{d.toUpperCase()}</button>;
  });
  const clearSearch = search ? <button aria-label="Clear search" onClick={() => onSearch('')}>×</button> : null;
  const filterButtons = (['all', 'live', 'upcoming', 'final', 'pinned'] as const).map(f => {
    const className = filter === f ? 'active' : '';
    const indicator = f === 'live' ? <span className="live-dot" /> : null;
    const label = { all: 'All games', live: 'Live now', upcoming: 'Upcoming', final: 'Final', pinned: 'Pinned' }[f];
    return <button key={f} className={className} aria-pressed={filter === f} onClick={() => onFilter(f)}>
      {indicator}{label}<span className="count">{counts[f]}</span>
    </button>;
  });
  return <>
    <div className="toolbar">
      <div className="date-control"><button className="icon-button" aria-label="Previous day" onClick={() => shift(-1)}><ChevronLeft size={17} /></button>
        <label className="sr-only" htmlFor="game-date">Game date</label>
        <input id="game-date" type="date" value={date} min="2000-01-01" max="2099-12-31" onChange={e => { if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) onDate(e.target.value); }} />
        <button className="icon-button" aria-label="Next day" onClick={() => shift(1)}><ChevronRight size={17} /></button>
      </div>
      <button className="today-button" onClick={() => onDate(localDate())}>Today</button>
      <div className="division-switch" role="group" aria-label="Division">{divisionButtons}</div>
      <label className="search"><Search size={16} /><span className="sr-only">Search teams</span><input placeholder="Find your team…" value={search} onChange={e => onSearch(e.target.value)} />{clearSearch}</label>
    </div>
    <nav className="filter-bar" aria-label="Filter games">{filterButtons}</nav>
  </>;
};

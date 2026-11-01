import './styles/LeagueTable.css';
import type { LeagueTable as LeagueTableData } from '../data/types';
import type { LeagueView } from '../hooks/useLeagueTables';

export const LeagueTable = ({ table, view }: { table: LeagueTableData; view: LeagueView }) => {
  const ranked = view === 'rankings';
  const column = ranked ? 'PTS' : 'CONF';
  const rows = table.rows.map(row => {
    const rank = ranked ? <span className="league-rank">{row.rank}</span> : null;
    const value = ranked ? row.points : row.conferenceRecord;
    return <tr key={row.id}><th scope="row">{rank}{row.name}</th><td>{value ?? '—'}</td><td>{row.record}</td></tr>;
  });
  return <div className="league-table-scroll"><table className="league-table">
    <caption>{table.title}<span>{table.subtitle}</span></caption>
    <thead><tr><th scope="col">TEAM</th><th scope="col">{column}</th><th scope="col">OVERALL</th></tr></thead>
    <tbody>{rows}</tbody>
  </table></div>;
};

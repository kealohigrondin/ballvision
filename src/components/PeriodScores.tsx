import './styles/PeriodScores.css';
import type { Team } from '../data/types';

export const PeriodScores = ({ home, away }: { home: Team; away: Team }) => {
  const periods = Array.from({ length: Math.max(home.quarters.length, away.quarters.length) }, (_, i) => i);
  if (!periods.length) return null;

  const headings = periods.map(i => {
    const label = i < 4 ? i + 1 : `${i - 3}OT`;
    return <th scope="col" key={i}>{label}</th>;
  });
  const rows = [away, home].map(team => {
    const scores = periods.map(i => <td key={i}>{team.quarters[i] ?? '—'}</td>);
    return <tr key={team.id}><th scope="row">{team.abbreviation}</th>{scores}<td>{team.score}</td></tr>;
  });

  return <div className="table-scroll"><table>
    <caption className="sr-only">Score by period</caption>
    <thead><tr><th scope="col">Team</th>{headings}<th scope="col">T</th></tr></thead>
    <tbody>{rows}</tbody>
  </table></div>;
};

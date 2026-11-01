import type { Team } from '../data/types';
import { TeamLogo } from './TeamLogo';

export const TeamRow = ({ team, possession, scheduled }: { team: Team; possession: boolean; scheduled: boolean }) => {
  const rank = team.rank ? <span className="rank">{team.rank}</span> : null;
  const possessionIndicator = possession
    ? <span className="possession" title="Possession" aria-label="Possession">◆</span> : null;
  const score = scheduled ? '—' : team.score;
  const record = team.record || team.abbreviation;

  return <div className="team-row">
    <TeamLogo team={team} />
    <div className="team-info">
      <div className="team-name">{rank}{team.name}{possessionIndicator}</div>
      <span className="record">{record}</span>
    </div>
    <span className="score">{score}</span>
  </div>;
};

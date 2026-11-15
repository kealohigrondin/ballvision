import { AWAY_LINE_DASH } from "@/shared/teamFill";

type TeamLineKeyProps = { color: string; dashed?: boolean };

// A short line sample in a team's chart style, used as a legend key: dashed
// for the away team, solid for the home team.
export const TeamLineKey = ({ color, dashed = false }: TeamLineKeyProps) => (
  <svg width="20" height="6" viewBox="0 0 20 6" aria-hidden="true">
    <line
      x1="0"
      x2="20"
      y1="3"
      y2="3"
      stroke={color}
      strokeWidth="2.5"
      strokeDasharray={dashed ? AWAY_LINE_DASH : undefined}
    />
  </svg>
);

import { Radio } from "lucide-react";

type MastHeadProps = {
  division: string;
};

const MastHead = ({ division }: MastHeadProps) => {
  return (
    <header className="masthead">
      <a className="brand" href="./" aria-label="Saturday Scoreboard home">
        <span className="brand-mark">
          <Radio size={22} />
        </span>
        SATURDAY<span className="brand-light">SCOREBOARD</span>
      </a>
      <span className="edition">
        COLLEGE FOOTBALL / {division.toUpperCase()}
      </span>
    </header>
  );
};
export default MastHead;

import "./styles/MastHead.css";
import { Radio } from "lucide-react";

type MastHeadProps = {
  division: string;
};

const MastHead = ({ division }: MastHeadProps) => {
  return (
    <header className="masthead">
      <a className="brand" href="./" aria-label="BALLVISION home">
        <span className="brand-mark">
          <Radio size={22} />
        </span>
        BALL<span className="brand-light">VISION</span>
      </a>
      <span className="edition">
        COLLEGE FOOTBALL / {division.toUpperCase()}
      </span>
    </header>
  );
};
export default MastHead;

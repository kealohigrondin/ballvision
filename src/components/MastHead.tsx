import "./styles/MastHead.css";
import { PanelRightClose, PanelRightOpen, Radio } from "lucide-react";

type MastHeadProps = {
  division: string;
  panelOpen: boolean;
  onTogglePanel: () => void;
};

const MastHead = ({ division, panelOpen, onTogglePanel }: MastHeadProps) => {
  const panelIcon = panelOpen ? (
    <PanelRightClose size={18} />
  ) : (
    <PanelRightOpen size={18} />
  );
  const panelLabel = panelOpen ? "Close league panel" : "Open league panel";
  return (
    <header className="masthead">
      <a className="brand" href="./" aria-label="BALLVISION home">
        <span className="brand-mark">
          <Radio size={22} />
        </span>
        BALL<span className="brand-light">VISION</span>
      </a>
      <div className="masthead-actions">
        <span className="edition">
          COLLEGE FOOTBALL / {division.toUpperCase()}
        </span>
        <button
          className="league-toggle"
          type="button"
          onClick={onTogglePanel}
          aria-label={panelLabel}
          title={panelLabel}
          aria-expanded={panelOpen}
          aria-controls="league-panel"
        >
          {panelIcon}
          <span>League</span>
        </button>
      </div>
    </header>
  );
};
export default MastHead;

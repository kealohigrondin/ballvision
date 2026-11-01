import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
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
    <Stack component="header" direction="row" className="masthead">
      <a className="brand" href="./" aria-label="BALLVISION home">
        <Box component="span" className="brand-mark">
          <Radio size={22} />
        </Box>
        BALL<span className="brand-light">VISION</span>
      </a>
      <Stack direction="row" className="masthead-actions">
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
      </Stack>
    </Stack>
  );
};
export default MastHead;

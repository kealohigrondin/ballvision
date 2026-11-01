import Typography from "@mui/material/Typography";
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
      <Typography
        variant="h5"
        component="a"
        className="brand"
        href="./"
        aria-label="BALLVISION home"
      >
        <Box component="span" className="brand-mark">
          <Radio size={22} />
        </Box>
        BALL
        <Typography variant="inherit" component="span" className="brand-light">
          VISION
        </Typography>
      </Typography>
      <Stack direction="row" className="masthead-actions">
        <Typography variant="overline" component="span" className="edition">
          COLLEGE FOOTBALL / {division.toUpperCase()}
        </Typography>
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

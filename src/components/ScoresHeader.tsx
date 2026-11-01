import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import type { ComponentProps } from "react";
import { Toolbar } from "./Toolbar";
import "./styles/ScoresHeader.css";

type ScoresHeaderProps = ComponentProps<typeof Toolbar> & {
  panelOpen: boolean;
  onTogglePanel: () => void;
};

export const ScoresHeader = ({
  date,
  onDate,
  division,
  onDivision,
  search,
  onSearch,
  filter,
  onFilter,
  counts,
  panelOpen,
  onTogglePanel,
}: ScoresHeaderProps) => {
  const day = new Date(`${date}T12:00:00`);
  const dayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(day);
  const panelLabel = panelOpen ? "Close league panel" : "Open league panel";
  const panelIcon = panelOpen ? (
    <PanelRightClose size={18} />
  ) : (
    <PanelRightOpen size={18} />
  );

  return (
    <div id="scores-header" className="scores-header">
      <Stack direction="row" className="section-heading">
        <Typography variant="h5" component="h1">
          {dayLabel}
          <span className="year"> {day.getFullYear()}</span>
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
        </button>
      </Stack>
      <Toolbar
        date={date}
        onDate={onDate}
        division={division}
        onDivision={onDivision}
        search={search}
        onSearch={onSearch}
        filter={filter}
        onFilter={onFilter}
        counts={counts}
      />
    </div>
  );
};

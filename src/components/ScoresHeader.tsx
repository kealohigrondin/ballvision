import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import type { ComponentProps } from "react";
import { Toolbar } from "./Toolbar";

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
    <Box
      id="scores-header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1,
        bgcolor: "background.default",
        py: 2,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
      >
        <Typography variant="h5" component="h1">
          {dayLabel} {day.getFullYear()}
        </Typography>
        <IconButton
          onClick={onTogglePanel}
          aria-label={panelLabel}
          title={panelLabel}
          aria-expanded={panelOpen}
          aria-controls="league-panel"
        >
          {panelIcon}
        </IconButton>
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
    </Box>
  );
};

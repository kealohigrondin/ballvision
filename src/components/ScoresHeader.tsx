import { controlHeightSx } from "../styles/shared";
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
      component="div"
      id="scores-header"
      className="scores-header"
      sx={{
        position: "sticky",
        top: "0",
        zIndex: "10",
        isolation: "isolate",
        paddingBottom: "8px",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0",
          zIndex: "-1",
          pointerEvents: "none",
          background: "var(--mui-app-background)",
          backgroundAttachment: "fixed",
        },
      }}
    >
      <Stack
        direction="row"
        className="section-heading"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: "16px",
          padding: "16px 0 8px",
          "& h2": { margin: "6px 0 0" },
          "@media (max-width: 599.95px)": {
            alignItems: "start",
            flexDirection: "column",
            padding: "24px 0 20px",
            gap: "14px",
          },
        }}
      >
        <Typography variant="h5" component="h1">
          {dayLabel}
          <Box
            component="span"
            className="year"
            sx={{
              color: "var(--mui-app-colors-year)",
              "@media (max-width: 599.95px)": { display: "none" },
            }}
          >
            {" "}
            {day.getFullYear()}
          </Box>
        </Typography>
        <Box
          component="button"
          className="league-toggle"
          type="button"
          onClick={onTogglePanel}
          aria-label={panelLabel}
          title={panelLabel}
          aria-expanded={panelOpen}
          aria-controls="league-panel"
          sx={[
            controlHeightSx,
            {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid var(--mui-palette-divider)",
              borderRadius: "24px",
              background: "var(--mui-app-colors-inputSurface)",
              padding: "0 18px",
              color: "var(--mui-palette-text-primary)",
              "&:hover": {
                background: "var(--mui-app-colors-buttonHoverSurface)",
              },
              '&[aria-expanded="true"]': {
                background: "var(--mui-app-colors-divisionSelectedSurface)",
              },
              "@media (max-width: 599.95px)": { padding: "0 12px" },
            },
          ]}
        >
          {panelIcon}
        </Box>
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

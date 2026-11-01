import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

import { Radio } from "lucide-react";

type EmptyStateProps = { title: string; detail: string };

export const EmptyState = ({ title, detail }: EmptyStateProps) => {
  return (
    <Paper
      elevation={0}
      sx={[
        {
          padding: "65px 24px",
          background: "var(--mui-app-colors-inputSurface)",
          border: "1px solid var(--mui-palette-divider)",
          borderRadius: "24px",
          textAlign: "center",
          color: "var(--mui-app-colors-emptyText)",
          "& svg": { color: "var(--mui-app-colors-emptyIcon)" },
          "& h2": {
            color: "var(--mui-app-colors-emptyHeading)",
            margin: "18px 0 8px",
          },
        },
        { borderRadius: "24px" },
      ]}
      className="empty-state"
    >
      <Radio size={30} />
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <p>{detail}</p>
    </Paper>
  );
};

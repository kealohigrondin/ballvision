import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import "./styles/EmptyState.css";
import { Radio } from "lucide-react";

type EmptyStateProps = { title: string; detail: string };

export const EmptyState = ({ title, detail }: EmptyStateProps) => {
  return (
    <Paper elevation={0} sx={{ borderRadius: "24px" }} className="empty-state">
      <Radio size={30} />
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <p>{detail}</p>
    </Paper>
  );
};

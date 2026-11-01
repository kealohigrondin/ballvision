import Paper from "@mui/material/Paper";
import "./styles/EmptyState.css";
import { Radio } from "lucide-react";

type EmptyStateProps = { title: string; detail: string };

export const EmptyState = ({ title, detail }: EmptyStateProps) => {
  return (
    <Paper elevation={0} sx={{ borderRadius: "24px" }} className="empty-state">
      <Radio size={30} />
      <h2>{title}</h2>
      <p>{detail}</p>
    </Paper>
  );
};

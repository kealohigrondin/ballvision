import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Radio } from "lucide-react";

type EmptyStateProps = { title: string; detail: string };

export const EmptyState = ({ title, detail }: EmptyStateProps) => (
  <Paper sx={{ p: 4 }}>
    <Stack spacing={2} sx={{ alignItems: "center" }}>
      <Radio />
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Typography>{detail}</Typography>
    </Stack>
  </Paper>
);

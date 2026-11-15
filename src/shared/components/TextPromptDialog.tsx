import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useState } from "react";

type TextPromptDialogProps = {
  open: boolean;
  title: string;
  label: string;
  helperText?: string;
  initialValue?: string;
  saveLabel: string;
  cancelLabel: string;
  onSave: (value: string) => void;
  onClose: () => void;
  id: string;
};

// A dialog that asks for one line of text and saves it on submit.
export const TextPromptDialog = ({
  open,
  title,
  label,
  helperText = "",
  initialValue = "",
  saveLabel,
  cancelLabel,
  onSave,
  onClose,
  id,
}: TextPromptDialogProps) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby={`${id}-title`}
      slotProps={{
        transition: { onEnter: () => setValue(initialValue) },
      }}
    >
      <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
      <form
        id={`${id}-form`}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(value.trim());
          onClose();
        }}
      >
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            id={`${id}-input`}
            label={label}
            helperText={helperText}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button id={`${id}-cancel`} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button id={`${id}-save`} type="submit" variant="contained">
            {saveLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

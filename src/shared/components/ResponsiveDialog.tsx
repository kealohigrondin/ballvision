import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { useCompactWindow } from "@/shared/hooks/useCompactWindow";

// Keeps the title readable by screen readers without showing it.
const visuallyHidden = {
  position: "absolute",
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

type ResponsiveDialogProps = {
  open: boolean;
  onClose: () => void;
  /** The dialog's name; shown as its heading unless a header is given. */
  title: string;
  /**
   * Replaces the visible heading and spans the dialog's full width; it sets
   * its own padding and bottom border, and leaves room for the close button
   * at the top right. The dialog's rounded corners clip its top.
   * The title still names the dialog.
   */
  header?: ReactNode;
  closeLabel: string;
  /** Prefix for element ids, unique per dialog on the page. */
  id: string;
  children: ReactNode;
};

// A Material 3 dialog with a title or custom header and a close button:
// centered on larger windows and full-screen on phones. Its content unmounts
// when closed.
export const ResponsiveDialog = ({
  open,
  onClose,
  title,
  header,
  closeLabel,
  id,
  children,
}: ResponsiveDialogProps) => {
  const compact = useCompactWindow();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)", {
    noSsr: true,
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={compact}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`${id}-title`}
      transitionDuration={reduceMotion ? 0 : undefined}
      slotProps={{
        paper: {
          id,
          sx: {
            // Same surface as the app's cards. Dark mode lightens dialogs
            // with a stronger overlay than cards (MUI sets it inline), so
            // paint the cards' overlay directly. Light mode has none.
            backgroundImage: "var(--mui-overlays-1, none)",
            // Match the cards' radius; full-screen dialogs stay square.
            ...(!compact && {
              borderRadius: "var(--mui-app-paperBorderRadius)",
            }),
          },
        },
      }}
    >
      <DialogTitle id={`${id}-title`} sx={header ? visuallyHidden : { pr: 8 }}>
        {title}
      </DialogTitle>
      <IconButton
        id={`${id}-close`}
        aria-label={closeLabel}
        title={closeLabel}
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          width: 48,
          height: 48,
        }}
      >
        <X size={20} />
      </IconButton>
      {header}
      {/* A custom header draws its own bottom border. */}
      <DialogContent dividers={!header}>{children}</DialogContent>
    </Dialog>
  );
};

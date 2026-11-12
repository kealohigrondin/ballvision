import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";

type MenuDrawerProps = {
  /** Names the menu button and the drawer, and is the drawer's headline. */
  label: string;
  closeLabel: string;
  children: ReactNode;
  iconSize?: number;
  /** Prefix for the button and drawer ids, e.g. `masthead-menu`. */
  id?: string;
};

// A menu button that opens a Material side sheet from the right edge.
export const MenuDrawer = ({
  label,
  closeLabel,
  children,
  iconSize = 24,
  id = "menu",
}: MenuDrawerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        id={`${id}-button`}
        aria-label={label}
        title={label}
        aria-expanded={open}
        aria-controls={`${id}-drawer`}
        onClick={() => setOpen(true)}
      >
        <Menu size={iconSize} />
      </IconButton>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            id: `${id}-drawer`,
            role: "dialog",
            "aria-label": label,
            sx: { p: 2, maxWidth: "85vw" },
          },
        }}
      >
        {/* Material 3 side sheet: a headline with a close button. */}
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
        >
          <Typography component="h2" variant="h6">
            {label}
          </Typography>
          <IconButton
            id={`${id}-close`}
            aria-label={closeLabel}
            title={closeLabel}
            onClick={() => setOpen(false)}
          >
            <X size={iconSize} />
          </IconButton>
        </Stack>
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          {children}
        </Stack>
      </Drawer>
    </>
  );
};

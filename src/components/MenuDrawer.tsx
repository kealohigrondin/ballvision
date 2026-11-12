import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { type LucideIcon, Menu, X } from "lucide-react";
import { type ReactNode, useState } from "react";

type MenuDrawerProps = {
  label: string;
  closeLabel: string;
  children: ReactNode;
  icon?: LucideIcon;
  iconSize?: number;
  id?: string;
};

// A button that opens a Material side sheet from the right edge.
export const MenuDrawer = ({
  label,
  closeLabel,
  children,
  icon: Icon = Menu,
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
        <Icon size={iconSize} />
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
            sx: { p: 0.5, maxWidth: "85vw" },
          },
        }}
      >
        {/* Windows 98 window title bar: a caption with a close button. */}
        <Stack
          direction="row"
          sx={(theme) => ({
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            px: 1,
            py: 0.5,
            background: theme.app.win98.titleBar,
            color: "#ffffff",
          })}
        >
          <Typography component="h2" variant="h6" sx={{ fontWeight: 700 }}>
            {label}
          </Typography>
          <IconButton
            id={`${id}-close`}
            aria-label={closeLabel}
            title={closeLabel}
            onClick={() => setOpen(false)}
            sx={(theme) => ({
              p: 0.25,
              bgcolor: "background.paper",
              boxShadow: theme.app.win98.bevel.button,
              "&:hover": {
                bgcolor: "background.paper",
                boxShadow: theme.app.win98.bevel.button,
              },
              "&:active": { boxShadow: theme.app.win98.bevel.pressed },
            })}
          >
            <X size={iconSize} />
          </IconButton>
        </Stack>
        <Stack spacing={1} sx={{ alignItems: "flex-start", px: 1.5 }}>
          {children}
        </Stack>
      </Drawer>
    </>
  );
};

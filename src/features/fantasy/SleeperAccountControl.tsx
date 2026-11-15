import { UserRound } from "lucide-react";
import { useState } from "react";

import { copy } from "@/copy";
import { useAppData } from "@/shared/appData/appDataContext";
import { TextPromptDialog } from "@/shared/components/TextPromptDialog";
import { ToolbarIconButton } from "@/shared/components/ToolbarIconButton";

type SleeperAccountControlProps = { showLabels?: boolean };

// A settings button that edits the Sleeper username used for fantasy players.
export const SleeperAccountControl = ({
  showLabels = false,
}: SleeperAccountControlProps) => {
  const { sleeperUsername, setSleeperUsername } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <>
      <ToolbarIconButton
        icon={UserRound}
        label={copy.fantasy.account}
        onClick={() => setOpen(true)}
        color="inherit"
        showLabel={showLabels}
      />
      <TextPromptDialog
        id="sleeper-account"
        open={open}
        title={copy.fantasy.account}
        label={copy.fantasy.usernameLabel}
        helperText={copy.fantasy.usernameHelp}
        initialValue={sleeperUsername}
        saveLabel={copy.fantasy.save}
        cancelLabel={copy.fantasy.cancel}
        onSave={setSleeperUsername}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

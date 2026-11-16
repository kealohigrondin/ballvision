import { Trophy } from "lucide-react";
import { useState } from "react";

import { copy } from "@/copy";
import { useAppData } from "@/shared/appData/appDataContext";
import { TextPromptDialog } from "@/shared/components/TextPromptDialog";
import { ToolbarIconButton } from "@/shared/components/ToolbarIconButton";

type EspnFantasyControlProps = { showLabels?: boolean };

// A settings button that edits the ESPN fantasy team link used for fantasy
// players.
export const EspnFantasyControl = ({
  showLabels = false,
}: EspnFantasyControlProps) => {
  const { espnFantasyTeam, setEspnFantasyTeam } = useAppData();
  const [open, setOpen] = useState(false);

  return (
    <>
      <ToolbarIconButton
        icon={Trophy}
        label={copy.fantasy.espnAccount}
        onClick={() => setOpen(true)}
        color="inherit"
        showLabel={showLabels}
      />
      <TextPromptDialog
        id="espn-fantasy-team"
        open={open}
        title={copy.fantasy.espnAccount}
        label={copy.fantasy.espnLinkLabel}
        helperText={copy.fantasy.espnLinkHelp}
        initialValue={espnFantasyTeam}
        saveLabel={copy.fantasy.save}
        cancelLabel={copy.fantasy.cancel}
        onSave={setEspnFantasyTeam}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

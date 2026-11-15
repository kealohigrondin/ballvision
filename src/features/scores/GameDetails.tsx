import Button from "@mui/material/Button";
import { ChevronRight } from "lucide-react";
import { type ReactNode, useState } from "react";

import { copy } from "@/copy";
import { ResponsiveDialog } from "@/shared/components/ResponsiveDialog";
import type { Game } from "@/shared/types";

import { GameDetailsBody } from "./GameDetailsBody";
import { GameHeader } from "./GameHeader";
import { GameSummaryProvider } from "./GameSummaryProvider";

type GameDetailsProps = {
  game: Game;
  /** Shown for unfinished games while the details are open. */
  liveDetails?: ReactNode;
};

// The card's "Game details" button and the dialog it opens.
export const GameDetails = ({ game, liveDetails }: GameDetailsProps) => {
  const [open, setOpen] = useState(false);
  const dialogId = `game-details-${game.id}`;

  return (
    <>
      <Button
        id={`${dialogId}-button`}
        fullWidth
        color="inherit"
        endIcon={<ChevronRight size={20} />}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        sx={{
          justifyContent: "space-between",
          minHeight: 36,
          px: 2,
          borderTop: 1,
          borderColor: "divider",
          borderRadius: 0,
          textTransform: "none",
          fontWeight: 400,
        }}
      >
        {copy.gameDetails.toggle}
      </Button>
      <ResponsiveDialog
        id={dialogId}
        open={open}
        onClose={() => setOpen(false)}
        title={copy.gameDetails.title(game.away.name, game.home.name)}
        header={<GameHeader game={game} />}
        closeLabel={copy.gameDetails.close}
      >
        <GameSummaryProvider game={game}>
          <GameDetailsBody game={game} liveDetails={liveDetails} />
        </GameSummaryProvider>
      </ResponsiveDialog>
    </>
  );
};

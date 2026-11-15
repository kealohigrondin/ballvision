import type { ReactNode } from "react";

import { useAppData } from "@/shared/appData/appDataContext";
import type { Game } from "@/shared/types";

import type { ChaosAudio } from "./audio/chaosAudio";
import type { DesktopNotifier } from "./desktopNotifier";
import { scoreNotificationContext } from "./scoreNotificationContext";
import { useScoreNotificationState } from "./useScoreNotificationState";

type ScoreNotificationProviderProps = {
  children: ReactNode;
  games: readonly Game[];
  /** When the scoreboard last updated; `null` before the first load. */
  updatedAt: Date | null;
  error?: string | null;
  audioFactory?: () => ChaosAudio;
  desktopNotifier?: DesktopNotifier;
};

// Watches the given games for scoring plays and plays a sound for each, and
// sends each to the desktop while ballvision is in the background.
export const ScoreNotificationProvider = ({
  children,
  games,
  updatedAt,
  error = null,
  audioFactory,
  desktopNotifier,
}: ScoreNotificationProviderProps) => {
  const { week, division, favoriteIds } = useAppData();
  const value = useScoreNotificationState({
    games,
    slateKey: `${division}:${week?.id ?? "current"}`,
    ready: updatedAt !== null && !error,
    favoriteIds,
    audioFactory,
    desktopNotifier,
  });

  return (
    <scoreNotificationContext.Provider value={value}>
      {children}
    </scoreNotificationContext.Provider>
  );
};

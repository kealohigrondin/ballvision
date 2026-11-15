import { copy } from "@/copy";
import { gameTime } from "@/shared/gameTime";

import type { DesktopAlert } from "./desktopNotifier";
import {
  notificationHeadline,
  type ScoreNotification,
} from "./scoreNotifications";

/** A score alert as a desktop notification: the headline, then the score. */
export const desktopAlert = (event: ScoreNotification): DesktopAlert => {
  const { game } = event;
  const scorer = [game.away, game.home].find((team) =>
    event.scoringTeamIds.includes(team.id),
  );

  return {
    title: notificationHeadline(event),
    body: copy.scoreNotification.desktopBody(
      `${game.away.name} ${game.away.score}`,
      `${game.home.name} ${game.home.score}`,
      gameTime(game),
    ),
    ...(scorer?.logo && { icon: scorer.logo }),
    tag: `ballvision-score-${game.id}`,
  };
};

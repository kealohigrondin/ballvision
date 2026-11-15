import { screen } from "@testing-library/react";

import { leagueNavDestinations } from "@/app/LeagueNavRail";
import type { PanelView } from "@/shared/types";

// Locate UI through the app's own copy constants and structure rather than
// hardcoded display text, so wording changes in the app do not break tests.

export const navRailButton = (view: PanelView) => {
  const destination = leagueNavDestinations.find(
    (candidate) => candidate.view === view,
  );
  if (!destination) {
    throw new Error(`No nav rail destination for ${view}`);
  }

  return screen.getByRole("button", { name: destination.label });
};

export const linkTo = (href: string) => {
  const link = screen
    .queryAllByRole("link")
    .find((candidate) => candidate.getAttribute("href") === href);
  if (!link) {
    throw new Error(`No link to ${href}`);
  }

  return link;
};

import { screen } from "@testing-library/react";
import { leagueNavDestinations } from "../../src/components/LeagueNavRail";
import type { LeagueView } from "../../src/hooks/useLeagueTables";

// Locate UI by structure rather than display copy so wording changes in the
// app do not break tests.

export const navRailButton = (view: LeagueView) => {
  const buttons = screen
    .getAllByRole("button")
    .filter(
      (button) => button.getAttribute("aria-controls") === "league-panel",
    );
  const index = leagueNavDestinations.findIndex(
    (destination) => destination.view === view,
  );
  const button = buttons[index];
  if (!button) throw new Error(`No nav rail button for ${view}`);
  return button;
};

export const linkTo = (href: string) => {
  const link = screen
    .queryAllByRole("link")
    .find((candidate) => candidate.getAttribute("href") === href);
  if (!link) throw new Error(`No link to ${href}`);
  return link;
};

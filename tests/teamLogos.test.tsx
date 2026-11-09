import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { TeamLogo } from "../src/components/TeamLogo";
import { ColorModeContext } from "../src/context/ColorModeContext";
import { parseScoreboard, parseStandings } from "../src/data/espn";

afterEach(cleanup);

const espnLogo = (league: "nfl" | "ncaa", id: string) =>
  `https://a.espncdn.com/i/teamlogos/${league}/500/${id}.png`;

const competitor = (
  id: string,
  homeAway: string,
  team: Record<string, unknown>,
) => ({
  id,
  homeAway,
  score: "0",
  team: { shortDisplayName: id, abbreviation: id, color: "112233", ...team },
  linescores: [],
});

// Parses one scheduled game and returns its home team.
const homeTeam = (id: string, team: Record<string, unknown>) =>
  parseScoreboard({
    events: [
      {
        id: "game",
        date: "2026-11-07T19:00:00Z",
        status: { period: 0, type: { state: "pre", name: "STATUS_SCHEDULED" } },
        competitions: [
          {
            competitors: [
              competitor(id, "home", team),
              competitor("away", "away", {}),
            ],
          },
        ],
      },
    ],
  })[0].home;

it("uses the bundled light and dark logos for an FBS team", () => {
  const georgia = homeTeam("61", { logo: espnLogo("ncaa", "61") });
  expect(georgia.logo).toContain("assets/logos/fbs/61-light");
  expect(georgia.logoDark).toContain("assets/logos/fbs/61-dark");
});

it("uses the bundled logos for an FCS team", () => {
  const utrgv = homeTeam("292", { logo: espnLogo("ncaa", "292") });
  expect(utrgv.logo).toContain("assets/logos/fcs/292-light");
});

it("tells an NFL team from a college team with the same ESPN id", () => {
  const bills = homeTeam("2", { logo: espnLogo("nfl", "buf") });
  const auburn = homeTeam("2", { logo: espnLogo("ncaa", "2") });
  expect(bills.logo).toContain("assets/logos/nfl/2-light");
  expect(auburn.logo).toContain("assets/logos/fbs/2-light");
});

it("keeps ESPN's logos for a team without a bundled logo", () => {
  const logo = espnLogo("ncaa", "99999");
  const logoDark = "https://a.espncdn.com/i/teamlogos/ncaa/500-dark/99999.png";
  const team = homeTeam("99999", { logo, logoDark });
  expect(team.logo).toBe(logo);
  expect(team.logoDark).toBe(logoDark);
});

it("uses the bundled logos for standings rows", () => {
  const [conference] = parseStandings({
    children: [
      {
        id: "sec",
        name: "SEC",
        standings: {
          entries: [
            {
              team: {
                id: "61",
                displayName: "Georgia",
                logos: [{ href: espnLogo("ncaa", "61") }],
              },
              stats: [],
            },
          ],
        },
      },
    ],
  });
  expect(conference.rows[0].logoDark).toContain("assets/logos/fbs/61-dark");
});

const renderLogo = (mode: "light" | "dark", logoDark?: string) =>
  render(
    <ColorModeContext.Provider value={{ mode, toggleMode: () => {} }}>
      <TeamLogo team={{ logo: "light.png", logoDark, abbreviation: "UGA" }} />
    </ColorModeContext.Provider>,
  );

const logoSrc = () =>
  screen.getByRole("presentation", { hidden: true }).getAttribute("src");

it("shows the dark logo in dark mode", () => {
  renderLogo("dark", "dark.png");
  expect(logoSrc()).toBe("dark.png");
});

it("shows the light logo in light mode", () => {
  renderLogo("light", "dark.png");
  expect(logoSrc()).toBe("light.png");
});

it("shows the light logo in dark mode when there is no dark logo", () => {
  renderLogo("dark");
  expect(logoSrc()).toBe("light.png");
});

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "../src/App";
import {
  leagueNavDestinations,
  LeagueNavRail,
} from "../src/components/LeagueNavRail";
import { LeaguePanel } from "../src/components/LeaguePanel";
import { copy } from "../src/copy";
import { parseRankings, parseStandings } from "../src/data/espn";
import type {
  LeagueSource,
  LeagueTable,
  ScoreboardSource,
  TeamScheduleSource,
} from "../src/data/types";
import { AppTheme } from "../src/providers/AppTheme";
import { scheduleGameStatus } from "../src/utils/teamSchedule";
import { emptyOddsSource } from "./helpers/appData";
import { LeagueTestProvider } from "./helpers/LeagueTestProvider";
import { oddsGame } from "./helpers/oddsFixture";
import { navRailButton } from "./helpers/queries";
import { scheduleGame } from "./helpers/scheduleFixture";

const stubCompactWindow = () =>
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );

const conference: LeagueTable = {
  id: "sec",
  title: "SEC",
  subtitle: "2026",
  rows: [{ id: "1", name: "Georgia", record: "7-1", conferenceRecord: "5-1" }],
};
const poll: LeagueTable = {
  id: "ap",
  title: "AP Top 25",
  subtitle: "Week 9",
  rows: [{ id: "2", name: "Miami", rank: 1, record: "7-0", points: "1500" }],
};

const source = (): LeagueSource => ({
  loadStandings: vi.fn().mockResolvedValue([conference]),
  loadRankings: vi.fn().mockResolvedValue([poll]),
});
afterEach(() => {
  cleanup();
  localStorage.removeItem("ballvision:app-data:v1");
});

describe("league data adapters", () => {
  it("reads overall and conference records", () => {
    const tables = parseStandings({
      children: [
        {
          id: "sec",
          name: "SEC",
          standings: {
            season: 2026,
            entries: [
              {
                team: {
                  id: "1",
                  shortDisplayName: "Georgia",
                  logos: [
                    {
                      href: "https://a.espncdn.com/i/teamlogos/ncaa/500/61.png",
                    },
                  ],
                },
                stats: [
                  { type: "total", summary: "7-1" },
                  { type: "vsconf", summary: "5-1" },
                ],
              },
            ],
          },
        },
      ],
    });
    expect(tables[0].rows[0]).toMatchObject(conference.rows[0]);
    expect(tables[0].rows[0].logo).toBe(
      "https://a.espncdn.com/i/teamlogos/ncaa/500/61.png",
    );
    expect(tables[0].subtitle).toBe("2026");
  });
  it("sorts college standings by conference winning percentage and preserves tied ordering", () => {
    const records = ["3-2", "4-0", "2-1", "4-1", "2-1", "0-0", undefined];
    const payload = {
      children: [
        {
          id: "conference",
          standings: {
            entries: records.map((record, index) => ({
              team: { id: String(index), displayName: `Team ${index}` },
              stats: [
                { type: "total", summary: "8-0" },
                { type: "vsconf", summary: record },
              ],
            })),
          },
        },
      ],
    };
    for (const division of ["fbs", "fcs"] as const) {
      expect(
        parseStandings(payload, division)[0].rows.map((row) => row.id),
      ).toEqual(["1", "3", "2", "4", "0", "5", "6"]);
    }
    expect(parseStandings(payload, "nfl")[0].rows.map((row) => row.id)).toEqual(
      ["0", "1", "2", "3", "4", "5", "6"],
    );
  });
  it("supports nested divisions and missing optional stats", () => {
    const tables = parseStandings({
      children: [
        {
          children: [
            {
              id: "east",
              name: "East",
              standings: {
                entries: [{ team: { id: "1", displayName: "Team" } }],
              },
            },
          ],
        },
      ],
    });
    expect(tables[0].rows[0]).toMatchObject({
      record: "—",
      conferenceRecord: "—",
    });
    expect(() => parseStandings({})).toThrow();
    expect(() => parseRankings({}, "fbs")).toThrow();
  });
  it("separates FBS/FCS polls and filters and sorts the Top 25", () => {
    const rank = (current: number) => ({
      current,
      team: {
        id: String(current),
        nickname: `Team ${current}`,
        logo: "https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png",
      },
      recordSummary: "6-0",
    });
    const data = {
      rankings: [
        { id: "ap", name: "AP Top 25", ranks: [rank(2), rank(1), rank(26)] },
        { id: "fcs", name: "FCS Coaches Poll", ranks: [rank(1)] },
        { id: "ii", name: "AFCA Division II Coaches Poll", ranks: [rank(1)] },
      ],
    };
    expect(parseRankings(data, "fbs").map((p) => p.id)).toEqual(["ap"]);
    expect(parseRankings(data, "fbs")[0].rows.map((r) => r.rank)).toEqual([
      1, 2,
    ]);
    expect(parseRankings(data, "fbs")[0].rows[0].logo).toBe(
      "https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png",
    );
    expect(parseRankings(data, "fcs").map((p) => p.id)).toEqual(["fcs"]);
  });
});

describe("league panel", () => {
  it("uses NFL standings when switching from a college poll", async () => {
    const provider = source();
    const { rerender } = render(
      <LeagueTestProvider source={provider} division="fbs">
        <LeagueNavRail />
        <LeaguePanel />
      </LeagueTestProvider>,
    );
    fireEvent.click(navRailButton("rankings"));
    await screen.findByRole("table", { name: /AP Top 25/ });
    rerender(
      <LeagueTestProvider source={provider} division="nfl">
        <LeagueNavRail />
        <LeaguePanel />
      </LeagueTestProvider>,
    );
    await screen.findByRole("table", { name: /SEC/ });
    expect(navRailButton("rankings").hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText(copy.league.division)).toBeTruthy();
    expect(provider.loadStandings).toHaveBeenCalledWith(
      "nfl",
      expect.any(AbortSignal),
    );
  });
  it("names every navigation rail button without showing visible text", () => {
    render(
      <LeagueTestProvider source={source()} division="fbs">
        <LeagueNavRail />
      </LeagueTestProvider>,
    );
    for (const destination of leagueNavDestinations) {
      const button = navRailButton(destination.view);
      expect(button.getAttribute("aria-label")).toBe(destination.label);
      expect(button.getAttribute("title")).toBe(destination.label);
      expect(button.textContent).toBe("");
    }
  });
  it("shows labelled destinations in a bottom navigation bar on compact windows", () => {
    stubCompactWindow();

    try {
      render(
        <AppTheme>
          <LeagueTestProvider source={source()} division="fbs">
            <LeagueNavRail />
          </LeagueTestProvider>
        </AppTheme>,
      );
      const nav = screen.getByRole("navigation", { name: copy.navRail.label });
      expect(getComputedStyle(nav).position).toBe("fixed");
      for (const destination of leagueNavDestinations) {
        expect(navRailButton(destination.view).textContent).toBe(
          destination.label,
        );
      }
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("opens the league panel as a bottom sheet on compact windows", async () => {
    stubCompactWindow();

    try {
      render(
        <AppTheme>
          <LeagueTestProvider source={source()} division="fbs">
            <LeagueNavRail />
            <LeaguePanel />
          </LeagueTestProvider>
        </AppTheme>,
      );
      const panel = await screen.findByRole("complementary", {
        name: copy.league.panel,
      });
      expect(getComputedStyle(panel).position).toBe("fixed");
      expect(getComputedStyle(panel).bottom).toContain("80px");
    } finally {
      vi.unstubAllGlobals();
    }
  });
  it("opens and closes from the navigation rail", async () => {
    const scores: ScoreboardSource = {
      load: vi.fn().mockResolvedValue([]),
      loadCalendar: vi.fn().mockResolvedValue({ weeks: [] }),
    };
    render(
      <AppTheme>
        <App
          source={scores}
          leagueSource={source()}
          oddsSource={emptyOddsSource}
        />
      </AppTheme>,
    );
    const standings = navRailButton("standings");
    fireEvent.click(standings);
    expect(standings.getAttribute("aria-expanded")).toBe("true");
  });
  it("switches between conference standings and Top 25 and selects a conference", async () => {
    const provider = source();
    vi.mocked(provider.loadStandings).mockResolvedValue([
      conference,
      { ...conference, id: "acc", title: "ACC" },
    ]);
    render(
      <LeagueTestProvider source={provider} division="fbs">
        <LeagueNavRail />
        <LeaguePanel />
      </LeagueTestProvider>,
    );
    await screen.findByRole("table", { name: /SEC/ });
    fireEvent.change(screen.getByLabelText(copy.league.conference), {
      target: { value: "acc" },
    });
    expect(screen.getByRole("table", { name: /ACC/ })).toBeTruthy();
    fireEvent.click(navRailButton("rankings"));
    expect(navRailButton("rankings").getAttribute("aria-pressed")).toBe("true");
    await screen.findByRole("table", { name: /AP Top 25/ });
    expect(screen.getByText("Miami")).toBeTruthy();
    expect(provider.loadRankings).toHaveBeenCalledWith(
      "fbs",
      expect.any(AbortSignal),
    );
  });
  it("shows a recoverable error and retries without a reload", async () => {
    const provider = source();
    vi.mocked(provider.loadStandings).mockRejectedValueOnce(
      new Error("offline"),
    );
    render(
      <LeagueTestProvider source={provider} division="fcs">
        <LeagueNavRail />
        <LeaguePanel />
      </LeagueTestProvider>,
    );
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: copy.common.retry }));
    await screen.findByRole("table", { name: /SEC/ });
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });
});

it("opens a team schedule from standings and Top 25 links", async () => {
  const provider = source();
  const load = vi
    .fn<TeamScheduleSource["load"]>()
    .mockResolvedValue({ season: "2026", games: [scheduleGame] });
  render(
    <LeagueTestProvider
      source={provider}
      division="fbs"
      scheduleSource={{ load }}
    >
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  await screen.findByRole("table", { name: /SEC/ });
  fireEvent.click(navRailButton("schedule"));
  expect(screen.getByText(copy.schedule.prompt)).toBeTruthy();
  expect(load).not.toHaveBeenCalled();
  fireEvent.click(navRailButton("standings"));
  fireEvent.click(await screen.findByRole("link", { name: "Georgia" }));
  await screen.findByRole("table", { name: copy.schedule.table("Georgia") });
  expect(navRailButton("schedule").getAttribute("aria-pressed")).toBe("true");
  expect(
    (screen.getByLabelText(copy.league.conference) as HTMLSelectElement).value,
  ).toBe("sec");
  expect(
    (screen.getByLabelText(copy.schedule.team) as HTMLSelectElement).value,
  ).toBe("1");
  expect(load).toHaveBeenLastCalledWith(
    { division: "fbs", teamId: "1" },
    expect.any(AbortSignal),
  );
  const opponentLink = screen.getByRole("link", { name: "Clemson" });
  expect(opponentLink.closest("th")?.textContent).toContain(
    `${copy.schedule.home} Clemson`,
  );
  expect(screen.getByText(scheduleGameStatus(scheduleGame, "1"))).toBeTruthy();
  fireEvent.click(opponentLink);
  await screen.findByRole("table", { name: copy.schedule.table("Clemson") });
  expect(load).toHaveBeenLastCalledWith(
    { division: "fbs", teamId: "8" },
    expect.any(AbortSignal),
  );
  expect(screen.getByRole("link", { name: "Georgia" })).toBeTruthy();
  expect(screen.getByText(scheduleGameStatus(scheduleGame, "8"))).toBeTruthy();
  fireEvent.click(navRailButton("rankings"));
  fireEvent.click(await screen.findByRole("link", { name: "Miami" }));
  await screen.findByRole("heading", { name: copy.schedule.table("Miami") });
  await waitFor(() =>
    expect(load).toHaveBeenLastCalledWith(
      { division: "fbs", teamId: "2" },
      expect.any(AbortSignal),
    ),
  );
});
it("selects a schedule team from conference and team dropdowns", async () => {
  const provider = source();
  vi.mocked(provider.loadStandings).mockResolvedValue([
    {
      ...conference,
      rows: [...conference.rows, { id: "3", name: "Alabama", record: "6-2" }],
    },
    {
      id: "acc",
      title: "ACC",
      subtitle: "2026",
      rows: [{ id: "8", name: "Clemson", record: "5-3" }],
    },
  ]);
  const load = vi
    .fn<TeamScheduleSource["load"]>()
    .mockResolvedValue({ season: "2026", games: [] });
  render(
    <LeagueTestProvider
      source={provider}
      division="fbs"
      scheduleSource={{ load }}
    >
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  await screen.findByRole("table", { name: /SEC/ });
  fireEvent.click(navRailButton("schedule"));
  const team = screen.getByLabelText(copy.schedule.team) as HTMLSelectElement;
  expect(team.disabled).toBe(true);
  fireEvent.change(screen.getByLabelText(copy.league.conference), {
    target: { value: "sec" },
  });

  const teamNames = () =>
    Array.from(
      (screen.getByLabelText(copy.schedule.team) as HTMLSelectElement).options,
    )
      .filter((option) => option.value)
      .map((option) => option.textContent);
  expect(teamNames()).toEqual(["Alabama", "Georgia"]);
  fireEvent.change(screen.getByLabelText(copy.league.conference), {
    target: { value: "acc" },
  });
  expect(teamNames()).toEqual(["Clemson"]);
  fireEvent.change(screen.getByLabelText(copy.schedule.team), {
    target: { value: "8" },
  });
  await screen.findByRole("heading", { name: copy.schedule.table("Clemson") });
  expect(load).toHaveBeenLastCalledWith(
    { division: "fbs", teamId: "8" },
    expect.any(AbortSignal),
  );
  expect(
    (screen.getByLabelText(copy.league.conference) as HTMLSelectElement).value,
  ).toBe("acc");
});
it("retries schedule failures and clears the selected team when switching leagues", async () => {
  const provider = source();
  const load = vi
    .fn<TeamScheduleSource["load"]>()
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValue({ season: "2026", games: [] });

  const build = (division: "fbs" | "nfl") => (
    <LeagueTestProvider
      source={provider}
      division={division}
      scheduleSource={{ load }}
    >
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>
  );
  const { rerender } = render(build("fbs"));
  fireEvent.click(await screen.findByRole("link", { name: "Georgia" }));
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: copy.common.retry }));
  await screen.findByText(copy.schedule.empty);
  rerender(build("nfl"));
  expect(
    screen.queryByRole("heading", { name: copy.schedule.table("Georgia") }),
  ).toBeNull();
  expect(navRailButton("rankings").hasAttribute("disabled")).toBe(true);
  expect(navRailButton("schedule")).toBeTruthy();
  expect(load).toHaveBeenCalledTimes(2);
});

const openScheduleFromGameCard = () => {
  const load = vi
    .fn<TeamScheduleSource["load"]>()
    .mockResolvedValue({ season: "2026", games: [scheduleGame] });
  const scoreboard: ScoreboardSource = {
    load: vi.fn().mockResolvedValue([oddsGame]),
    loadCalendar: vi.fn().mockResolvedValue({ weeks: [], currentWeekId: "" }),
  };
  render(
    <AppTheme>
      <App
        source={scoreboard}
        leagueSource={source()}
        scheduleSource={{ load }}
        oddsSource={emptyOddsSource}
      />
    </AppTheme>,
  );

  return { load };
};

it("opens the closed league panel when a game card team name is clicked", async () => {
  openScheduleFromGameCard();
  const teamLink = await screen.findByRole("link", {
    name: oddsGame.away.name,
  });
  expect(
    screen.queryByRole("complementary", { name: copy.league.panel }),
  ).toBeNull();
  fireEvent.click(teamLink);
  expect(
    screen.getByRole("complementary", { name: copy.league.panel }),
  ).toBeTruthy();
});

it("opens the league panel on the clicked team's schedule", async () => {
  const { load } = openScheduleFromGameCard();
  fireEvent.click(
    await screen.findByRole("link", { name: oddsGame.away.name }),
  );
  await screen.findByRole("table", {
    name: copy.schedule.table(oddsGame.away.name),
  });
  expect(navRailButton("schedule").getAttribute("aria-pressed")).toBe("true");
  expect(load).toHaveBeenLastCalledWith(
    { division: "fbs", teamId: oddsGame.away.id },
    expect.any(AbortSignal),
  );
});

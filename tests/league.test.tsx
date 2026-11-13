import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "../src/App";
import { LeagueNavRail } from "../src/components/LeagueNavRail";
import { LeaguePanel } from "../src/components/LeaguePanel";
import type { AppData } from "../src/context/appDataContext";
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
  rows: [
    {
      id: "2",
      name: "Miami",
      rank: 1,
      record: "7-0",
      points: "1500",
      rankChange: 2,
    },
  ],
};

const nflRow = (id: string, name: string, extra = {}) => ({
  id,
  name,
  record: "5-3",
  conferenceRecord: "3-2",
  ...extra,
});
// One table per NFL standings view and conference, as parseNflStandings
// returns them.
const nflTables: LeagueTable[] = [
  {
    id: "8-wildcard",
    title: "AFC",
    subtitle: "2026",
    nflView: "wildcard",
    rows: [
      nflRow("2", "Bills", { rank: 4, dividerAfter: "dashed" }),
      nflRow("12", "Chiefs", { rank: 5 }),
    ],
  },
  {
    id: "7-wildcard",
    title: "NFC",
    subtitle: "2026",
    nflView: "wildcard",
    rows: [nflRow("26", "Seahawks", { rank: 1 })],
  },
  {
    id: "4",
    title: "AFC East",
    subtitle: "2026",
    nflView: "division",
    rows: [nflRow("2", "Bills")],
  },
  {
    id: "1",
    title: "NFC West",
    subtitle: "2026",
    nflView: "division",
    rows: [nflRow("26", "Seahawks")],
  },
  {
    id: "8-conference",
    title: "AFC",
    subtitle: "2026",
    nflView: "conference",
    rows: [nflRow("12", "Chiefs"), nflRow("2", "Bills")],
  },
  {
    id: "7-conference",
    title: "NFC",
    subtitle: "2026",
    nflView: "conference",
    rows: [nflRow("26", "Seahawks")],
  },
];

const source = (): LeagueSource => ({
  loadStandings: vi.fn((division) =>
    Promise.resolve(division === "nfl" ? nflTables : [conference]),
  ),
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
    await screen.findByRole("table", { name: /AFC/ });
    expect(navRailButton("rankings").hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText(copy.league.standingsView)).toBeTruthy();
    expect(provider.loadStandings).toHaveBeenCalledWith(
      "nfl",
      expect.any(AbortSignal),
    );
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
    (screen.getByLabelText(copy.schedule.team) as HTMLInputElement).value,
  ).toBe("Georgia");
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

const scheduleTeamOptions = () => {
  fireEvent.keyDown(screen.getByLabelText(copy.schedule.team), {
    key: "ArrowDown",
  });

  return screen.getAllByRole("option").map((option) => option.textContent);
};

it("lists every college team in the schedule picker regardless of conference", async () => {
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
  render(
    <LeagueTestProvider source={provider} division="fbs">
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  await screen.findByRole("table", { name: /SEC/ });
  fireEvent.click(navRailButton("schedule"));
  expect(screen.queryByLabelText(copy.league.conference)).toBeNull();
  expect(scheduleTeamOptions()).toEqual(["Alabama", "Clemson", "Georgia"]);
});

it("lists every NFL team once in the schedule picker regardless of division", async () => {
  render(
    <LeagueTestProvider source={source()} division="nfl">
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  await screen.findByRole("table", { name: /league-table-AFC/ });
  fireEvent.click(navRailButton("schedule"));
  expect(screen.queryByLabelText(copy.league.division)).toBeNull();
  expect(scheduleTeamOptions()).toEqual(["Bills", "Chiefs", "Seahawks"]);
});

it("selects a schedule team by typing its name", async () => {
  const load = vi
    .fn<TeamScheduleSource["load"]>()
    .mockResolvedValue({ season: "2026", games: [] });
  render(
    <LeagueTestProvider
      source={source()}
      division="nfl"
      scheduleSource={{ load }}
    >
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  await screen.findByRole("table", { name: /league-table-AFC/ });
  fireEvent.click(navRailButton("schedule"));
  const input = screen.getByLabelText(copy.schedule.team);
  input.focus();
  fireEvent.change(input, { target: { value: "chi" } });
  expect(
    screen.getAllByRole("option").map((option) => option.textContent),
  ).toEqual(["Chiefs"]);
  fireEvent.click(screen.getByRole("option", { name: "Chiefs" }));
  await screen.findByRole("heading", { name: copy.schedule.table("Chiefs") });
  expect(load).toHaveBeenLastCalledWith(
    { division: "nfl", teamId: "12" },
    expect.any(AbortSignal),
  );
  expect((input as HTMLInputElement).value).toBe("Chiefs");
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

const renderNflPanel = (appData: Partial<AppData> = {}) =>
  render(
    <LeagueTestProvider source={source()} division="nfl" appData={appData}>
      <LeaguePanel />
    </LeagueTestProvider>,
  );

const tableNames = () =>
  screen
    .getAllByRole("table")
    .map(
      (table) =>
        table.querySelector('[id^="league-table-title-"]')?.textContent,
    );

it("shows the AFC and NFC wild card standings for the wildcard view", async () => {
  renderNflPanel({ nflStandingsView: "wildcard" });
  await screen.findByRole("table", { name: /league-table-AFC/ });
  expect(tableNames()).toEqual(["AFC", "NFC"]);
  expect(screen.getAllByText("Bills").length).toBeGreaterThan(0);
});

it("shows every division table for the division view", async () => {
  renderNflPanel({ nflStandingsView: "division" });
  await screen.findByRole("table", { name: /league-table-AFC East/ });
  expect(tableNames()).toEqual(["AFC East", "NFC West"]);
});

it("shows the AFC and NFC conference standings for the conference view", async () => {
  renderNflPanel({ nflStandingsView: "conference" });
  await screen.findByRole("table", { name: /league-table-AFC/ });
  expect(tableNames()).toEqual(["AFC", "NFC"]);
  const afcTeams = within(screen.getAllByRole("table")[0]).getAllByRole("link");
  expect(afcTeams.map((link) => link.textContent)).toEqual(["Chiefs", "Bills"]);
});

it("saves the chosen NFL standings view", async () => {
  const setNflStandingsView = vi.fn();
  renderNflPanel({ setNflStandingsView });
  fireEvent.change(await screen.findByLabelText(copy.league.standingsView), {
    target: { value: "division" },
  });
  expect(setNflStandingsView).toHaveBeenCalledWith("division");
});

it("gives each league table a title id built from its name", async () => {
  renderNflPanel({ nflStandingsView: "division" });
  await screen.findByRole("table", { name: /AFC East/ });
  const ids = screen
    .getAllByRole("table")
    .map((table) => table.querySelector('[id^="league-table-title-"]')?.id);
  expect(ids).toEqual([
    "league-table-title-afc-east",
    "league-table-title-nfc-west",
  ]);
});

it("shows each team's rank trend in the Top 25 table", async () => {
  const { container } = render(
    <LeagueTestProvider source={source()} division="fbs">
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  fireEvent.click(navRailButton("rankings"));
  await screen.findByRole("table", { name: /AP Top 25/ });
  expect(
    screen.getByRole("columnheader", { name: copy.league.trend }),
  ).toBeTruthy();
  expect(container.querySelector("#league-trend-2")?.textContent).toBe("+2");
});

it("leaves the trend column out of standings tables", async () => {
  render(
    <LeagueTestProvider source={source()} division="fbs">
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  await screen.findByRole("table", { name: /SEC/ });
  expect(
    screen.queryByRole("columnheader", { name: copy.league.trend }),
  ).toBeNull();
});

const committee: LeagueTable = {
  id: "cfp",
  title: "Playoff Committee Rankings",
  subtitle: "Week 11",
  rows: [{ id: "61", name: "Georgia", rank: 1, record: "8-1" }],
};

const renderRankings = () => {
  const provider = source();
  vi.mocked(provider.loadRankings).mockResolvedValue([committee, poll]);
  render(
    <LeagueTestProvider source={provider} division="fbs">
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  fireEvent.click(navRailButton("rankings"));
};

it("leaves the points column out of the playoff committee rankings", async () => {
  renderRankings();
  await screen.findByRole("table", { name: /Playoff Committee/ });
  expect(screen.queryByRole("columnheader", { name: "PTS" })).toBeNull();
});

it("shows the points column for a points-based poll", async () => {
  renderRankings();
  await screen.findByRole("table", { name: /Playoff Committee/ });
  fireEvent.change(screen.getByLabelText(copy.league.poll), {
    target: { value: "ap" },
  });
  expect(screen.getByRole("columnheader", { name: "PTS" })).toBeTruthy();
});

it("puts the trend column last in the Top 25 table", async () => {
  render(
    <LeagueTestProvider source={source()} division="fbs">
      <LeagueNavRail />
      <LeaguePanel />
    </LeagueTestProvider>,
  );
  fireEvent.click(navRailButton("rankings"));
  await screen.findByRole("table", { name: /AP Top 25/ });
  expect(screen.getAllByRole("columnheader").at(-1)?.textContent).toBe(
    copy.league.trend,
  );
});

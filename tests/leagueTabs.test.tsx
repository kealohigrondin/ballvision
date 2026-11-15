import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppTheme } from "@/app/AppTheme";
import { LeagueNavRail } from "@/app/LeagueNavRail";
import { LeaguePanel } from "@/app/LeaguePanel";
import MastHead from "@/app/MastHead";
import { copy } from "@/copy";
import { ScoresHeader } from "@/features/scores/ScoresHeader";
import type { LeagueTable } from "@/features/standings/types";
import type { AppData } from "@/shared/appData/appDataContext";
import { NavTabs } from "@/shared/components/NavTabs";

import { AppDataTestProvider, createAppData } from "./helpers/appData";
import { navRailButton } from "./helpers/queries";

afterEach(cleanup);

const renderWithApp = (ui: React.ReactNode, app: Partial<AppData> = {}) =>
  render(
    <AppTheme>
      <AppDataTestProvider value={createAppData(app)}>{ui}</AppDataTestProvider>
    </AppTheme>,
  );

const element = (container: HTMLElement, id: string) => {
  const found = container.querySelector(`#${id}`);
  if (!found) {
    throw new Error(`#${id} is not rendered.`);
  }

  return found;
};

describe("NavTabs", () => {
  const options = [
    { value: "a", label: "Alpha" },
    { value: "b", label: "Beta" },
  ] as const;

  it("selects the tab for the current value", () => {
    const { container } = render(
      <NavTabs
        id="test-tab"
        label="Sections"
        value="b"
        options={options}
        onChange={vi.fn()}
      />,
    );
    expect(element(container, "test-tab-b").getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("reports the value of a clicked tab", () => {
    const onChange = vi.fn();
    const { container } = render(
      <NavTabs
        id="test-tab"
        label="Sections"
        value="a"
        options={options}
        onChange={onChange}
      />,
    );
    fireEvent.click(element(container, "test-tab-b"));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("MastHead league tabs", () => {
  it("offers NCAAF, NFL, EPL and UCL in that order", () => {
    const { container } = renderWithApp(<MastHead />);
    const tabs = [...container.querySelectorAll('[id^="league-tab-"]')];
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      copy.mastHead.leagues.ncaaf,
      copy.mastHead.leagues.nfl,
      copy.mastHead.leagues.epl,
      copy.mastHead.leagues.ucl,
    ]);
  });

  it("selects the tab of the league being shown", () => {
    const { container } = renderWithApp(<MastHead />, {
      division: "ucl",
      league: "ucl",
    });
    expect(
      element(container, "league-tab-ucl").getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("switches league when a tab is clicked", () => {
    const setLeague = vi.fn();
    const { container } = renderWithApp(<MastHead />, { setLeague });
    fireEvent.click(element(container, "league-tab-epl"));
    expect(setLeague).toHaveBeenCalledWith("epl");
  });
});

describe("ScoresHeader division control", () => {
  it("offers FBS and FCS in college football", () => {
    const { container } = renderWithApp(<ScoresHeader />);
    const buttons = element(container, "division-control").querySelectorAll(
      "button",
    );
    expect([...buttons].map((button) => button.textContent)).toEqual([
      copy.scoresHeader.divisions.fbs,
      copy.scoresHeader.divisions.fcs,
    ]);
  });

  it("is left out of leagues without divisions", () => {
    const { container } = renderWithApp(<ScoresHeader />, {
      division: "epl",
      league: "epl",
    });
    expect(container.querySelector("#division-control")).toBeNull();
  });
});

const soccerTable: LeagueTable = {
  id: "1",
  title: "Premier League",
  subtitle: "2026-27",
  soccer: true,
  rows: [
    {
      id: "359",
      name: "Arsenal",
      rank: 1,
      record: "9-0-1",
      played: "10",
      goalDifference: "+10",
      points: "27",
    },
  ],
};

describe("LeaguePanel for soccer", () => {
  const renderPanel = () =>
    render(
      <AppTheme>
        <AppDataTestProvider
          value={createAppData({ division: "epl", league: "epl" })}
          standings={{
            tables: [soccerTable],
            selected: soccerTable,
            visibleTables: [soccerTable],
          }}
        >
          <LeagueNavRail />
          <LeaguePanel />
        </AppDataTestProvider>
      </AppTheme>,
    );

  it("heads the table with played, W-D-L, goal difference and points", () => {
    const { container } = renderPanel();
    const headers = [
      ...element(container, "league-table-title-premier-league")
        .closest("tr")!
        .querySelectorAll("th"),
    ].slice(1);
    expect(headers.map((header) => header.textContent)).toEqual([
      copy.league.columns.played,
      copy.league.columns.winDrawLoss,
      copy.league.columns.goalDifference,
      copy.league.columns.points,
    ]);
  });

  it("fills a team's row from its soccer record", () => {
    const { container } = renderPanel();
    const cells = [
      ...element(container, "league-table-title-premier-league")
        .closest("table")!
        .querySelectorAll("tbody td"),
    ];
    expect(cells.map((cell) => cell.textContent)).toEqual([
      "10",
      "9-0-1",
      "+10",
      "27",
    ]);
  });

  it("leaves out the stage picker when there is only one table", () => {
    const { container } = renderPanel();
    expect(container.querySelector("#league-panel select")).toBeNull();
  });

  it("disables the rankings destination", () => {
    renderPanel();
    expect(navRailButton("rankings").hasAttribute("disabled")).toBe(true);
  });
});

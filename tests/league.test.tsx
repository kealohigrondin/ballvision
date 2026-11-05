import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { AppTheme } from "../src/components/AppTheme";
import { LeaguePanel } from "../src/components/LeaguePanel";
import { parseRankings, parseStandings } from "../src/data/espn";
import type {
  LeagueSource,
  LeagueTable,
  ScoreboardSource,
} from "../src/data/types";

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
afterEach(cleanup);

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
      <LeaguePanel source={provider} division="fbs" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Top 25" }));
    await screen.findByRole("table", { name: /AP Top 25/ });
    rerender(<LeaguePanel source={provider} division="nfl" />);
    await screen.findByRole("table", { name: /SEC/ });
    expect(screen.queryByRole("button", { name: "Top 25" })).toBeNull();
    expect(screen.getByLabelText("Division")).toBeTruthy();
    expect(provider.loadStandings).toHaveBeenCalledWith(
      "nfl",
      expect.any(AbortSignal),
    );
  });
  it("opens and closes using the masthead button", async () => {
    const scores: ScoreboardSource = { load: vi.fn().mockResolvedValue([]) };
    render(
      <AppTheme>
        <App source={scores} leagueSource={source()} />
      </AppTheme>,
    );
    await screen.findByRole("table", { name: /SEC/ });
    const close = screen.getByRole("button", { name: "Close league panel" });
    expect(close.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(close);
    expect(
      screen.queryByRole("complementary", { name: "League information" }),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open league panel" }));
    expect(
      screen.getByRole("complementary", { name: "League information" }),
    ).toBeTruthy();
  });
  it("switches between conference standings and Top 25 and selects a conference", async () => {
    const provider = source();
    vi.mocked(provider.loadStandings).mockResolvedValue([
      conference,
      { ...conference, id: "acc", title: "ACC" },
    ]);
    render(<LeaguePanel source={provider} division="fbs" />);
    await screen.findByRole("table", { name: /SEC/ });
    fireEvent.change(screen.getByLabelText("Conference"), {
      target: { value: "acc" },
    });
    expect(screen.getByRole("table", { name: /ACC/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Top 25" }));
    expect(
      screen
        .getByRole("button", { name: "Top 25" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
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
    render(<LeaguePanel source={provider} division="fcs" />);
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByRole("table", { name: /SEC/ });
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });
});

import { expect, it } from "vitest";

import { parseNflStandings } from "../src/data/espn";

type TeamSpec = { id: string; name: string; seed: number; winPercent: number };

const entry = ({ id, name, seed, winPercent }: TeamSpec) => ({
  team: { id, shortDisplayName: name, abbreviation: name.slice(0, 3) },
  stats: [
    { name: "playoffSeed", type: "playoffseed", value: seed },
    { name: "winPercent", type: "winpercent", value: winPercent },
    { name: "overall", type: "total", summary: "5-3" },
    { name: "vs. Conf.", type: "vsconf", summary: "3-2" },
  ],
});

const conference = (id: string, abbreviation: string, teams: TeamSpec[]) => ({
  id,
  abbreviation,
  name: `${abbreviation} conference`,
  standings: { seasonDisplayName: "2026", entries: teams.map(entry) },
});

// Eight teams per conference, listed out of seed order as ESPN can return
// them. Seeds 3 and 4 have the same record as seed 5.
const afc = conference("8", "AFC", [
  { id: "a3", name: "AFC Three", seed: 3, winPercent: 0.75 },
  { id: "a1", name: "AFC One", seed: 1, winPercent: 0.875 },
  { id: "a5", name: "AFC Five", seed: 5, winPercent: 0.75 },
  { id: "a2", name: "AFC Two", seed: 2, winPercent: 0.8 },
  { id: "a4", name: "AFC Four", seed: 4, winPercent: 0.75 },
  { id: "a7", name: "AFC Seven", seed: 7, winPercent: 0.6 },
  { id: "a6", name: "AFC Six", seed: 6, winPercent: 0.7 },
  { id: "a8", name: "AFC Eight", seed: 8, winPercent: 0.6 },
]);
const nfc = conference("7", "NFC", [
  { id: "n1", name: "NFC One", seed: 1, winPercent: 0.9 },
]);

const divisions = {
  children: [
    {
      name: "American Football Conference",
      children: [
        {
          id: "4",
          name: "AFC East",
          standings: {
            entries: [{ team: { id: "a1", shortDisplayName: "AFC One" } }],
          },
        },
      ],
    },
    {
      name: "National Football Conference",
      children: [
        {
          id: "1",
          name: "NFC West",
          standings: {
            entries: [{ team: { id: "n1", shortDisplayName: "NFC One" } }],
          },
        },
      ],
    },
  ],
};

const tables = () => parseNflStandings({ children: [afc, nfc] }, divisions);

const view = (name: string) =>
  tables().filter((table) => table.nflView === name);

it("orders wildcard standings by playoff seed and shows the seed as rank", () => {
  const [afcWildcard] = view("wildcard");
  expect(afcWildcard.rows.map((row) => row.rank)).toEqual([
    1, 2, 3, 4, 5, 6, 7, 8,
  ]);
});

it("draws dividers after the division leaders and the last wild card", () => {
  const [afcWildcard] = view("wildcard");
  expect(
    afcWildcard.rows.filter((row) => row.dividerAfter).map((row) => row.rank),
  ).toEqual([4, 7]);
});

it("orders conference standings by record, breaking ties by seed", () => {
  const [afcConference] = view("conference");
  expect(afcConference.rows.map((row) => row.id)).toEqual([
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "a8",
  ]);
});

it("keeps ESPN's division order for division standings", () => {
  expect(view("division").map((table) => table.title)).toEqual([
    "AFC East",
    "NFC West",
  ]);
});

it("lists the AFC before the NFC in the wildcard and conference views", () => {
  expect(view("wildcard").map((table) => table.title)).toEqual(["AFC", "NFC"]);
  expect(view("conference").map((table) => table.title)).toEqual([
    "AFC",
    "NFC",
  ]);
});

it("gives every table a unique id across views", () => {
  const ids = tables().map((table) => table.id);
  expect(new Set(ids).size).toBe(ids.length);
});

it("dashes the line after the division leaders and keeps the cut line solid", () => {
  const [afcWildcard] = view("wildcard");

  const divider = (seed: number) =>
    afcWildcard.rows.find((row) => row.rank === seed)?.dividerAfter;
  expect([divider(4), divider(7)]).toEqual(["dashed", "solid"]);
});

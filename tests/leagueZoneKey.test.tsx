import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { copy } from "@/copy";
import { LeagueZoneKey } from "@/features/standings/LeagueZoneKey";

afterEach(cleanup);

it("labels a single position on its own", () => {
  expect(copy.league.zonePositions(5, 5)).toBe("5");
});

it("labels a run of positions as a range", () => {
  expect(copy.league.zonePositions(18, 20)).toBe("18–20");
});

it("lists each zone with its positions", () => {
  render(
    <LeagueZoneKey
      id="zones"
      zones={[
        { note: "Champions League", first: 1, last: 4 },
        { note: "Europa League", first: 5, last: 5 },
      ]}
    />,
  );
  const items = [...document.querySelectorAll("#zones li")].map(
    (item) => item.textContent,
  );
  expect(items).toEqual(["1–4Champions League", "5Europa League"]);
});

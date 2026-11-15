import { describe, expect, it } from "vitest";

import { hasRankings, isDivision, leagueOf, sportOf } from "@/shared/leagues";

describe("leagueOf", () => {
  it("groups FBS and FCS under college football", () => {
    expect([leagueOf("fbs"), leagueOf("fcs")]).toEqual(["ncaaf", "ncaaf"]);
  });

  it("gives the NFL, Premier League and Champions League their own tabs", () => {
    expect([leagueOf("nfl"), leagueOf("epl"), leagueOf("ucl")]).toEqual([
      "nfl",
      "epl",
      "ucl",
    ]);
  });
});

describe("sportOf", () => {
  it("plays the Premier League and Champions League as soccer", () => {
    expect([sportOf("epl"), sportOf("ucl")]).toEqual(["soccer", "soccer"]);
  });

  it("plays college and NFL games as football", () => {
    expect([sportOf("fbs"), sportOf("fcs"), sportOf("nfl")]).toEqual([
      "football",
      "football",
      "football",
    ]);
  });
});

describe("hasRankings", () => {
  it("offers Top 25 polls only for college divisions", () => {
    expect(
      (["fbs", "fcs", "nfl", "epl", "ucl"] as const).filter(hasRankings),
    ).toEqual(["fbs", "fcs"]);
  });
});

describe("isDivision", () => {
  it("accepts every division", () => {
    expect(["fbs", "fcs", "nfl", "epl", "ucl"].every(isDivision)).toBe(true);
  });

  it("rejects league tab names and other values", () => {
    expect(["ncaaf", "mls", 1, undefined].some(isDivision)).toBe(false);
  });
});

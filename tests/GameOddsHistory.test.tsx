import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { GameDetails } from "../src/components/GameDetails";
import { copy } from "../src/copy";
import type { Game, OddsHistorySource } from "../src/data/types";
import { AppTheme } from "../src/providers/AppTheme";
import { PolymarketGameProvider } from "../src/providers/PolymarketGameProvider";
import { formatProbability } from "../src/utils/odds";
import { AppDataTestProvider, createAppData } from "./helpers/appData";
import { oddsGame, oddsQuote } from "./helpers/oddsFixture";

const history = {
  away: [
    { timestamp: 10000, probability: 0.4 },
    { timestamp: 20000, probability: 0.6 },
  ],
  home: [
    { timestamp: 10000, probability: 0.6 },
    { timestamp: 20000, probability: 0.4 },
  ],
};
afterEach(cleanup);

const show = (load: OddsHistorySource["load"], game: Game = oddsGame) =>
  render(
    <AppTheme>
      <AppDataTestProvider
        value={createAppData({ paused: true })}
        polymarket={{
          historySource: { load },
          quotes: { [oddsGame.id]: { ...oddsQuote, updatedAt: 30000 } },
        }}
      >
        <PolymarketGameProvider game={game}>
          <GameDetails game={game} />
        </PolymarketGameProvider>
      </AppDataTestProvider>
    </AppTheme>,
  );

it("loads on expansion, changes history range, allows keyboard inspection, and stops on collapse", async () => {
  const load = vi.fn<OddsHistorySource["load"]>().mockResolvedValue(history);
  show(load);
  expect(load).not.toHaveBeenCalled();
  const details = screen.getByRole("button", { name: copy.gameDetails.toggle });
  fireEvent.click(details);
  const chart = await screen.findByRole("img", {
    name: copy.oddsHistory.chart(
      oddsGame.away.abbreviation,
      oddsGame.home.abbreviation,
    ),
  });
  expect(load).toHaveBeenCalledWith(
    { awayTokenId: "222", homeTokenId: "111", range: "1h" },
    expect.any(AbortSignal),
  );
  const section = screen.getByRole("region", {
    name: copy.oddsHistory.label,
  });
  expect(
    within(section).getByText(formatProbability(0.75), { exact: false }),
  ).toBeTruthy();
  fireEvent.keyDown(chart, { key: "Home" });
  expect(
    within(section).getByText(formatProbability(0.4), { exact: false }),
  ).toBeTruthy();
  load.mockImplementationOnce(
    (_, signal) =>
      new Promise((_, reject) => {
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: copy.oddsHistory.ranges["6h"] }),
  );
  await waitFor(() =>
    expect(load).toHaveBeenLastCalledWith(
      { awayTokenId: "222", homeTokenId: "111", range: "6h" },
      expect.any(AbortSignal),
    ),
  );
  const signal = load.mock.calls.at(-1)![1];
  fireEvent.click(details);
  expect(signal.aborted).toBe(true);
});
it("shows a recoverable error and retries", async () => {
  const load = vi
    .fn<OddsHistorySource["load"]>()
    .mockRejectedValueOnce(new Error("Offline"))
    .mockResolvedValue(history);
  show(load);
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
  await screen.findByText(copy.oddsHistory.loadError);
  fireEvent.click(screen.getByRole("button", { name: copy.common.retry }));
  await screen.findByRole("img", {
    name: copy.oddsHistory.chart(
      oddsGame.away.abbreviation,
      oddsGame.home.abbreviation,
    ),
  });
});
it("shows an empty state instead of inventing a historical curve", async () => {
  show(
    vi
      .fn<OddsHistorySource["load"]>()
      .mockResolvedValue({ away: [], home: [] }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
  await screen.findByText(copy.oddsHistory.empty);
  expect(screen.queryByRole("img")).toBeNull();
});

it("renders last-play text without nesting paragraphs", () => {
  const { container } = show(vi.fn().mockResolvedValue(history), {
    ...oddsGame,
    lastPlay: "Pass complete for a touchdown.",
  });
  expect(screen.getByText(copy.gameDetails.lastPlay)).toBeTruthy();
  expect(screen.getByText("Pass complete for a touchdown.")).toBeTruthy();
  expect(container.querySelector("p p")).toBeNull();
});

const showWithoutOdds = (game: Game, error: boolean) =>
  render(
    <AppTheme>
      <AppDataTestProvider
        value={createAppData({ paused: true })}
        polymarket={{ quotes: {}, error }}
      >
        <PolymarketGameProvider game={game}>
          <GameDetails game={game} />
        </PolymarketGameProvider>
      </AppDataTestProvider>
    </AppTheme>,
  );

it("hints that a privacy extension may be blocking Polymarket when odds fail to load", () => {
  showWithoutOdds(oddsGame, true);
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
  expect(screen.getByText(copy.gameDetails.oddsBlocked)).toBeTruthy();
  expect(screen.queryByText(copy.gameDetails.chartUnavailable)).toBeNull();
});

it("keeps the plain unavailable message when no market exists or the game is final", () => {
  showWithoutOdds(oddsGame, false);
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
  expect(screen.getByText(copy.gameDetails.chartUnavailable)).toBeTruthy();
  cleanup();
  showWithoutOdds({ ...oddsGame, state: "final" }, true);
  fireEvent.click(
    screen.getByRole("button", { name: copy.gameDetails.toggle }),
  );
  expect(screen.queryByText(copy.gameDetails.oddsBlocked)).toBeNull();
});

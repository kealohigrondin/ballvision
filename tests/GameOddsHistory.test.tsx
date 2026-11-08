import { PolymarketGameProvider } from "../src/providers/PolymarketGameProvider";
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
import { AppTheme } from "../src/providers/AppTheme";
import { AppDataTestProvider, createAppData } from "./helpers/appData";
import { oddsGame, oddsQuote } from "./helpers/oddsFixture";
import type { Game, OddsHistorySource } from "../src/data/types";

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
  const details = screen.getByRole("button", { name: "Game details" });
  fireEvent.click(details);
  const chart = await screen.findByRole("img", {
    name: "Polymarket implied win probability history for PSU and WASH",
  });
  expect(load).toHaveBeenCalledWith(
    { awayTokenId: "222", homeTokenId: "111", range: "1h" },
    expect.any(AbortSignal),
  );
  const section = screen.getByRole("region", {
    name: "Polymarket odds history",
  });
  expect(within(section).getByText("PSU — 75.0% (-300)")).toBeTruthy();
  fireEvent.keyDown(chart, { key: "Home" });
  expect(within(section).getByText("PSU — 40.0% (+150)")).toBeTruthy();
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
  fireEvent.click(screen.getByRole("button", { name: "6H" }));
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
  fireEvent.click(screen.getByRole("button", { name: "Game details" }));
  await screen.findByText("Unable to load odds history.");
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await screen.findByRole("img", {
    name: /Polymarket implied win probability/,
  });
});
it("shows an empty state instead of inventing a historical curve", async () => {
  show(
    vi
      .fn<OddsHistorySource["load"]>()
      .mockResolvedValue({ away: [], home: [] }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Game details" }));
  await screen.findByText("No polymarket history is available.");
  expect(
    screen.queryByRole("img", { name: /Polymarket implied win probability/ }),
  ).toBeNull();
});

it("renders last-play text without nesting paragraphs", () => {
  const { container } = show(vi.fn().mockResolvedValue(history), {
    ...oddsGame,
    lastPlay: "Pass complete for a touchdown.",
  });
  expect(screen.getByText("Last play")).toBeTruthy();
  expect(screen.getByText("Pass complete for a touchdown.")).toBeTruthy();
  expect(container.querySelector("p p")).toBeNull();
});

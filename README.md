# BALLVISION

Your live game companion. A React + TypeScript football dashboard for FBS, FCS, and the NFL. Runs in browser with no API key or backend. ESPN is an undocumented upstream API; its availability, coverage, and schema may change.

## Run locally

This project is intended for local use. Internet access is needed to fetch ESPN scores.

Run `./start.sh` and open http://127.0.0.1:5173. Press Ctrl+C in the terminal to stop. The launcher uses your installed Node.js or the workspace runtime downloaded during setup.

## Develop

Install Node.js 22 or newer, then run from this directory:

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. To validate and build:

```sh
npm test
npm run build
npm run preview
```

### Pre-push checks

`npm ci` points Git at the hooks in `.githooks/`. Before every `git push`, the `pre-push` hook runs `npm run lint` (ESLint and Prettier), `npm run typecheck` and `npm test`, and rejects the push if any of them fail. In an emergency, `git push --no-verify` skips it.

## End-to-end tests and screenshots

Playwright drives the app in Chromium against a Vite dev server. ESPN and Polymarket requests are served from `e2e/fixtures/` by `e2e/support/mockApis.ts`, so runs are offline and deterministic.

```sh
npx playwright install chromium   # first run only
npm run test:e2e                  # browser tests
npm run screenshots               # writes PNGs to ./screenshots
```

On every pull request that changes `src/components/`, the **PR screenshots** workflow runs `npm run screenshots` (desktop, tablet and mobile viewports, each in dark and light, at the exact screen size), stores the images on the `pr-screenshots` branch, and posts (or updates) a comment on the PR showing them inline.

`dist/` is a static production build and can be served by any static host. Direct ESPN requests currently support CORS. If that changes, implement a server-side provider behind `ScoreboardSource` rather than coupling proxy logic to components. No credentials are shipped to the browser.

## Architecture

- `src/data/types.ts`: provider-independent game model and `ScoreboardSource` contract.
- `src/data/espn.ts`: HTTP access and defensive transformation of ESPN payloads.
- `src/hooks/useScoreboard.ts`: refresh lifecycle, aborts/timeouts, errors, tab visibility, and query changes. The source is injected for substitution and testing.
- `src/hooks/useFavorites.ts`: optional browser-local pin storage with versioned key.
- `src/components/`: one component per file; cards, team presentation, game details, period scores, toolbar, refresh controls, loading and error states each have a focused responsibility.
- `src/utils/`: shared date and game-time formatting without UI or provider dependencies.
- Components use MUI's default appearance. The primary green, light/dark mode, and shared 40px control height are configured in `src/theme.ts`. Minimal `sx` handles layout and responsive score columns; no standalone CSS files are loaded.
- `src/context/appDataContext.ts`: typed shared app state, accessed with `useAppData` inside `AppDataProvider`.
- `src/hooks/useAppDataState.ts`: owns UI controls and local favorites, without API data.
- `src/context/espnDataContext.ts` / `EspnDataProvider`: own the scoreboard subscription, derived filters/counts, standings, and polls. Consumers use `useEspnData()`.
- `src/context/polymarketDataContext.ts` / `PolymarketDataProvider`: own batched live moneylines. `PolymarketGameProvider` scopes the current quote, history range, history data, and dropdown lifecycle to each game; odds and chart components use `usePolymarketGame()` directly.
- `src/App.tsx`: composes UI, ESPN, and Polymarket providers with replaceable data sources. `Dashboard` composes the layout; headers, grid, refresh controls, and league panel consume context directly.

Polling runs 20 seconds after each completed request; requests time out after 15 seconds. Hidden tabs stop scheduled polling and refresh on return. A failed refresh retains the last successful snapshot with a warning. Changing dates/divisions clears the prior slate and cancels obsolete requests. Game clocks display the reported feed value; they are not extrapolated. All kickoff times use the browser's local timezone. FBS/FCS/NFL data availability follows ESPN; the app cannot guarantee coverage outside the selected feed.

Pinned game IDs stay on this browser. There is no account, tracking, database, or continuous animation. Details expand natively and logos load lazily.

Tests cover upstream parsing, postponed/incomplete games, update failures, cancellation, stale response races, and paused polling. No live network requests are required for tests.

## League panel

Use the panel button in the scores header to open or close the right-side panel. Choose **Conference standings** or **Top 25**, then choose a conference or poll. The panel follows the FBS/FCS/NFL selection. NFL shows division standings without college polls; league records and rankings are current-season data, independent of the scoreboard date. On smaller screens it stacks above the scoreboard.

`LeagueSource` is an injectable contract separate from `ScoreboardSource`; the ESPN implementation and response adapters remain in `src/data/espn.ts`. `useLeagueTables` owns cancellation, 15-second timeouts, retries, and five-minute refreshes while visible. Closing the panel stops its requests. `LeaguePanel` and `LeagueTable` use inline `sx` and shared theme tokens.

## MUI layout and theme

`AppTheme` installs the MUI `ThemeProvider` and `CssBaseline`. Gumbolt Regular is bundled locally and registered through `MuiCssBaseline`, with `sans-serif` as the fallback. Colors, typography sizes, and breakpoints use MUI defaults, with the existing green as the primary color in each mode. `theme.app.controlHeight` sets outlined inputs and segmented buttons to 40px; text fields use MUI’s small size for matching label and input spacing. `Grid` powers game cards and loading placeholders using shared responsive sizing. Layout-only `sx` preserves the sticky header, league panel, and responsive score columns.

Quarter scores and the total-column heading appear when an individual game card is at least `theme.app.boxScoreMinWidth` pixels wide (480px by default). A named container query measures each card independently of the screen or game grid width.

## Live moneyline odds

Game cards show Polymarket moneylines immediately before the favorite button. The [public market-data API](https://docs.polymarket.com/market-data/discover-markets) requires no API key. Read-only requests go directly from the browser; no account or local proxy is needed. These are American odds derived from prediction-market midpoint probabilities, not sportsbook point spreads or executable betting quotes.

`OddsSource` is injectable through `App` / `PolymarketDataProvider`. `src/data/polymarket.ts` discovers the current NFL or college football series, paginates full-game moneyline markets, and matches both team identities and kickoff time. Ambiguous, closed, suspended, unmatched, and final games do not receive live quotes. FCS coverage depends on available markets. Discovery is cached for two minutes; fresh midpoint prices are requested in batches every 20 seconds via `useGameOdds`. Polling follows pause/visibility controls, cancels obsolete requests, and times out after 15 seconds. Failed refreshes retain the last quote with a “stale” label; unavailable prices display “Odds —”. Hover over a quote for implied probabilities and its update time. The existing refresh button refreshes both scores and odds.

Open **Game details** on a game with a matched Polymarket market to view its odds-history graph. The 1H/6H/1D controls select the time window; hover, tap, or focus the chart and use arrow keys to inspect timestamps. Both teams use their own historical prices, with the latest live quote appended. The graph shows implied win probability on a 0–100% scale, and its readout includes American odds. History loads only while the dropdown is open, refreshes every 30 seconds, follows pause/visibility controls, and cancels on collapse or market/range changes. Empty or unavailable history is explicitly labeled. `OddsHistorySource` is injectable through `App` / `PolymarketDataProvider`; the default uses Polymarket's public `prices-history` endpoint with a 30-second cache.

All provider components live in `src/providers/`: `AppTheme`, `AppDataProvider`, `EspnDataProvider`, `PolymarketDataProvider`, and `PolymarketGameProvider`. App UI preferences (panel visibility, selected date, division, game filter, search, and auto-refresh pause) persist under the versioned localStorage key `ballvision:app-data:v1`. Restored values are validated; malformed or unsupported settings fall back to defaults, and the app still works when browser storage is unavailable. Favorites retain their existing separate storage key. API scores, odds, and history remain fresh in-memory provider data.

## Score celebrations

New live score increases for pinned games in the selected slate trigger a score alert with the updated score and an opaque background gradient using the away and home team colors. The scoring team’s score uses a heavier font weight and a red chalk circle. Scores are compared between ESPN updates, so alerts follow the feed's refresh cadence. Initial loads, newly discovered games, decreases, and repeated corrected scores do not trigger alerts. Final-score transitions from a previously live game are included. Simultaneous scoring games queue in order; each modal dismisses after seven seconds, and **I have seen enough** clears the queue. Changing the date or division resets the baseline and queue. Unpinning a game removes its queued celebration; pinning does not replay earlier scores.

Click **Enable chaos sounds** once to arm browser audio. Tennessee scoring alerts play `rocky-top.mp3`, taking priority over all other sound rules. A 6–7 or 7–6 scoreline otherwise plays “sixseven” (takes priority over scoring type). Field goals (one team gaining three points between updates) play “oh baby a triple,” and PATs (one team gaining one point) play “anothaone.” Other scores and previews randomly select the DJ airhorn, bangarang (`untitled_313.mp3`), Fox Sports, or Wii Sports. All eight clips are bundled in `src/audio/`. Clips are loaded once when audio is enabled; mute stops playback immediately. No remote meme images or audio are downloaded. The flame button previews a clearly labeled celebration using a current pinned game, without modifying the actual scoreboard. `ScoreCelebrationProvider` owns the queue and audio lifecycle; detection and audio playback remain separate from UI components.

## Team schedules

The league panel includes a **Schedule** tab. Click a team’s name in **Standings** or **Top 25** to select it and open its current-season schedule; no team picker is shown in Schedule. Opponent names in the schedule are links that open that opponent’s schedule. NFL teams are selected from standings. The schedule lists opponents, home/away and neutral-site games, final results from the selected team’s perspective, live game status, kickoff times, and broadcasts. Unconfirmed kickoff times show **Time TBD**. Regular-season and postseason games are combined in date order. Schedule requests run only while the panel and Schedule tab are open, refresh every five minutes, and cancel when changing teams or divisions. Changing divisions clears the selected team. Data and team selection live in the ESPN context, with a separately injectable schedule source.

# BALLVISION

Your live game companion. A React + TypeScript college football dashboard. Runs in a Linux browser with no API key or backend. ESPN is an undocumented upstream API; its availability, coverage, and schema may change.

## Run locally

This project is intended for local use. No hosting account or sign-in is needed. The server binds only to this computer. Internet access is needed to fetch ESPN scores.

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

`dist/` is a static production build and can be served by any static host. Direct ESPN requests currently support CORS. If that changes, implement a server-side provider behind `ScoreboardSource` rather than coupling proxy logic to components. No credentials are shipped to the browser.

## Architecture

- `src/data/types.ts`: provider-independent game model and `ScoreboardSource` contract.
- `src/data/espn.ts`: HTTP access and defensive transformation of ESPN payloads.
- `src/hooks/useScoreboard.ts`: refresh lifecycle, aborts/timeouts, errors, tab visibility, and query changes. The source is injected for substitution and testing.
- `src/hooks/useFavorites.ts`: optional browser-local pin storage with versioned key.
- `src/components/`: one component per file; cards, team presentation, game details, period scores, toolbar, refresh controls, loading and error states each have a focused responsibility.
- `src/utils/`: shared date and game-time formatting without UI or provider dependencies.
- Component styles live in `src/components/styles/` (`GameCard.css`, etc.) and are imported by the owning component. `App.css` owns page layout; `theme.css` beside `App.css` owns all color and font tokens; `styles.css` contains element defaults, accessibility focus defaults, and reduced-motion defaults.
- `src/App.tsx`: composes features and owns view filters; receives a replaceable source.

Polling runs 20 seconds after each completed request; requests time out after 15 seconds. Hidden tabs stop scheduled polling and refresh on return. A failed refresh retains the last successful snapshot with a warning. Changing dates/divisions clears the prior slate and cancels obsolete requests. Game clocks display the reported feed value; they are not extrapolated. All kickoff times use the browser's local timezone. FBS/FCS data availability follows ESPN; the app cannot guarantee coverage outside the selected feed.

Pinned game IDs stay on this browser. There is no account, tracking, database, or continuous animation. Details expand natively and logos load lazily.

Tests cover upstream parsing, postponed/incomplete games, update failures, cancellation, stale response races, and paused polling. No live network requests are required for tests.

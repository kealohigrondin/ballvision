# Saturday Scoreboard

A React + TypeScript college football dashboard. Runs in a Linux browser with no API key or backend. ESPN is an undocumented upstream API; its availability, coverage, and schema may change.

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
- `src/components/`: reusable game cards, team rows, filter/date toolbar, empty state.
- `src/App.tsx`: composes features and owns view filters; receives a replaceable source.

Polling runs 20 seconds after each completed request; requests time out after 15 seconds. Hidden tabs stop scheduled polling and refresh on return. A failed refresh retains the last successful snapshot with a warning. Changing dates/divisions clears the prior slate and cancels obsolete requests. Game clocks display the reported feed value; they are not extrapolated. All kickoff times use the browser's local timezone. FBS/FCS data availability follows ESPN; the app cannot guarantee coverage outside the selected feed.

Pinned game IDs stay on this browser. There is no account, tracking, database, or continuous animation. Details expand natively and logos load lazily.

Tests cover upstream parsing, postponed/incomplete games, update failures, cancellation, stale response races, and paused polling. No live network requests are required for tests.

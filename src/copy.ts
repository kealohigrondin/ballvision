// User-facing UI copy. Components render these strings and tests query by
// them, so wording can change here without breaking tests.

export const copy = {
  common: {
    retry: "Retry",
    tryAgain: "Try again",
    emptyValue: "—",
  },
  grid: {
    label: "Football games",
    loading: "Loading scores",
    feedDown: "The feed is taking a timeout.",
    feedDownDetail: "Try refreshing to reconnect to ESPN.",
    watchlistEmpty: "Your watchlist starts here.",
    watchlistEmptyDetail:
      "Use the star on a game to pin it to the top of your scoreboard.",
    noGames: "No games on this field.",
    noGamesDetail: "Try another week, division, or filter.",
  },
  gameCard: {
    inProgress: "Game in progress",
    kickoff: "Kickoff",
    possession: "Possession",
    scoresByPeriod: (away: string, home: string) =>
      `${away} at ${home} scores by period`,
    favorite: (favorite: boolean, away: string, home: string) =>
      `${favorite ? "Unfavorite" : "Favorite"} ${away} at ${home}`,
    pin: (favorite: boolean) => (favorite ? "Unpin game" : "Pin game"),
  },
  periodScores: {
    label: "Score by period",
    team: "Team",
    total: "T",
  },
  gameDetails: {
    toggle: "Game details",
    title: (away: string, home: string) => `${away} at ${home}`,
    close: "Close game details",
    chartUnavailable: "Polymarket chart unavailable for this game.",
    oddsBlocked: "Couldn't reach Polymarket. Disable adblock for this site.",
    lastPlay: "Last play",
    unavailable: "Additional details are not available yet.",
    statsError: "Couldn't load leaders and team stats.",
  },
  teamStats: {
    title: "Team stats",
    loading: "Loading team stats",
    labels: {
      totalYards: "Total Yards",
      turnovers: "Turnovers",
      firstDowns: "1st Downs",
      penalties: "Penalties",
      thirdDown: "3rd Down",
      fourthDown: "4th Down",
      possession: "Possession",
    },
  },
  scoringPlays: {
    title: "Scoring summary",
    loading: "Loading scoring plays",
    none: "No scoring plays yet.",
    // "1st Quarter" … "4th Quarter", then "Overtime", "2nd Overtime" and on.
    period: (period: number) => {
      const ordinal = (n: number) => ["1st", "2nd", "3rd"][n - 1] ?? `${n}th`;
      if (period <= 4) {
        return `${ordinal(period)} Quarter`;
      }

      return period === 5 ? "Overtime" : `${ordinal(period - 4)} Overtime`;
    },
    // Read in place of the two score columns.
    score: (away: string, awayScore: number, home: string, homeScore: number) =>
      `${away} ${awayScore}, ${home} ${homeScore}`,
  },
  gameLeaders: {
    title: "Game leaders",
    loading: "Loading game leaders",
    categories: { passing: "PASS", rushing: "RUSH", receiving: "REC" },
    detail: (position: string, jersey: string, team: string) =>
      [[position, jersey && `#${jersey}`].filter(Boolean).join(" "), team]
        .filter(Boolean)
        .join(" - "),
  },
  odds: {
    loading: "Odds…",
    missing: "Odds —",
    unavailable: "Odds are temporarily unavailable.",
    noMarket: "No matching open moneyline market is available.",
    even: "Even odds",
    stale: "stale",
  },
  oddsHistory: {
    label: "Polymarket odds history",
    loading: "Loading Polymarket odds history",
    loadError: "Unable to load odds history.",
    empty: "No polymarket history is available.",
    title: "Polymarket win probability",
    range: "Odds history range",
    ranges: { "1h": "1H", "6h": "6H", "1d": "1D" },
    outdated: "History may be out of date.",
    chart: (away: string, home: string) =>
      `Polymarket implied win probability history for ${away} and ${home}`,
  },
  scoresHeader: {
    division: "Division",
    divisions: { fbs: "FBS", fcs: "FCS" },
    search: "Search teams",
    searchPlaceholder: "Find your team…",
    clearSearch: "Clear search",
    filter: "Filter games",
    filters: {
      all: "All",
      live: "Live",
      upcoming: "Next",
      final: "Final",
      pinned: "Pinned",
    },
  },
  week: {
    label: "Week",
    matchweek: (number: number) => `Matchweek ${number}`,
  },
  mastHead: {
    settings: "Settings",
    closeSettings: "Close settings",
    leaguesLabel: "Leagues",
    leagues: { ncaaf: "NCAAF", nfl: "NFL", epl: "EPL", ucl: "UCL" },
  },
  fantasy: {
    title: "My fantasy players",
    bench: "Bench",
    playerDetails: (position: string, team: string) => `${position} · ${team}`,
    points: (points: number) => `${points.toFixed(1)} pts`,
    account: "Sleeper account",
    usernameLabel: "Sleeper username",
    usernameHelp: "Shows your fantasy players in NFL game details.",
    espnAccount: "ESPN fantasy team",
    espnLinkLabel: "ESPN team link",
    espnLinkHelp:
      "Open your team on ESPN Fantasy and paste its link. Private leagues load only while you're signed in to ESPN in this browser.",
    save: "Save",
    cancel: "Cancel",
  },
  sync: {
    pause: "Pause auto-refresh",
    resume: "Resume auto-refresh",
    refresh: "Refresh scores",
    updating: "Updating…",
    paused: "Auto-refresh paused",
    connecting: "Connecting…",
    connectionError: " · Connection error",
    updated: (time: string) => `Updated ${time}`,
  },
  theme: {
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
  },
  scoreNotification: {
    enableSound: "Enable score alerts",
    retrySound: "Retry score alerts",
    muteSound: "Mute score alerts",
    unmuteSound: "Unmute score alerts",
    test: "Test score notification",
    dismissAll: "I have seen enough",
    clock: "Game clock and period",
  },
  navRail: {
    label: "League navigation",
    rankings: "Rankings",
    standings: "Standings",
    schedule: "Schedules",
  },
  league: {
    panel: "League information",
    division: "Division",
    conference: "Conference",
    poll: "Poll",
    stage: "Stage",
    titles: {
      schedule: "Team schedule",
      nfl: "NFL standings",
      soccer: "League table",
      rankings: "Top 25",
      conference: "Conference standings",
    },
    standingsView: "Standings view",
    trend: "TREND",
    columns: {
      conference: "CONF",
      overall: "OVR",
      points: "PTS",
      played: "P",
      winDrawLoss: "W-D-L",
      goalDifference: "GD",
    },
    zones: "Table positions",
    zonePositions: (first: number, last: number) =>
      first === last ? `${first}` : `${first}–${last}`,
    trendNew: "NEW",
    trendUnchanged: "-",
    nflViews: {
      wildcard: "Wild card",
      division: "Division",
      conference: "Conference",
    },
    loading: "Loading league data…",
    empty: "No league data is available for this division.",
    error:
      "Unable to update league data. Any displayed records may be out of date.",
  },
  schedule: {
    team: "Team",
    selectTeam: "Select a team",
    prompt: "Choose a team to view its schedule.",
    noTeams: "No matching teams",
    loading: "Loading team schedule…",
    empty: "No games are available for this team’s current season.",
    error:
      "Unable to update this team’s schedule. Displayed games may be out of date.",
    currentSeason: "Current season",
    home: "vs",
    away: "@",
    table: (team: string) => `${team} schedule`,
  },
} as const;

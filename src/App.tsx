import "./App.css";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import clsx from "clsx";
import { useState } from "react";
import { espnSource, espnLeagueSource } from "./data/espn";
import type { Division, LeagueSource, ScoreboardSource } from "./data/types";
import { useScoreboard } from "./hooks/useScoreboard";
import { useFavorites } from "./hooks/useFavorites";
import { GameGrid } from "./components/GameGrid";
import { ErrorBanner } from "./components/ErrorBanner";
import { type Filter } from "./components/Toolbar";
import { localDate } from "./utils/date";
import MastHead from "./components/MastHead";
import { LeaguePanel } from "./components/LeaguePanel";
import { Footer } from "./components/Footer";
import { ScoresHeader } from "./components/ScoresHeader";

type AppProps = {
  source?: ScoreboardSource;
  leagueSource?: LeagueSource;
};

const App = ({
  source = espnSource,
  leagueSource = espnLeagueSource,
}: AppProps) => {
  const [panelOpen, setPanelOpen] = useState(true);
  const [date, setDate] = useState(localDate);
  const [division, setDivision] = useState<Division>("fbs");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [paused, setPaused] = useState(false);
  const { games, loading, error, updatedAt, refresh } = useScoreboard(
    source,
    { date, division },
    paused,
  );
  const favorites = useFavorites();
  const pinned = (id: string) => favorites.ids.includes(id);
  const counts = {
    all: games.length,
    live: games.filter((g) => g.state === "live").length,
    upcoming: games.filter((g) => g.state === "upcoming").length,
    final: games.filter((g) => g.state === "final").length,
    pinned: games.filter((g) => pinned(g.id)).length,
  };
  const visible = games
    .filter(
      (g) =>
        (filter === "all" ||
          (filter === "pinned" ? pinned(g.id) : g.state === filter)) &&
        `${g.home.name} ${g.home.abbreviation} ${g.away.name} ${g.away.abbreviation}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => Number(pinned(b.id)) - Number(pinned(a.id)));
  const getResultsLabel = () => {
    if (filter === "pinned") {
      return "YOUR WATCHLIST";
    }
    if (filter === "live") {
      return "ON THE FIELD";
    }
    return "AROUND THE LEAGUE";
  };
  const resultsLabel = getResultsLabel();
  const resultUnit = visible.length === 1 ? "game" : "games";
  const searchLabel = search ? ` matching “${search}”` : "";
  const resultCount = `${visible.length} ${resultUnit}${searchLabel}`;

  const errorBanner = error ? (
    <ErrorBanner message={error} loading={loading} onRetry={refresh} />
  ) : null;
  const leaguePanel = panelOpen ? (
    <LeaguePanel source={leagueSource} division={division} />
  ) : null;

  const columns = panelOpen
    ? {
        xs: "minmax(0, 1fr)",
        md: "minmax(0, 1fr) 360px",
        lg: "minmax(0, 1fr) 380px",
      }
    : "minmax(0, 1fr)";

  return (
    <Container
      maxWidth={false}
      className="app-shell"
      sx={{ px: { xs: 2, sm: 3, lg: 5 } }}
    >
      <MastHead
        onTogglePause={() => setPaused((current) => !current)}
        loading={loading}
        paused={paused}
        error={error}
        updatedAt={updatedAt}
        refresh={refresh}
      />
      <Box component="main">
        <Box
          className={clsx("dashboard-layout", panelOpen && "panel-open")}
          sx={{
            display: "grid",
            gridTemplateColumns: columns,
            gap: { xs: 2.5, lg: 3.5 },
            alignItems: "start",
          }}
        >
          <Stack className="dashboard-main" sx={{ minWidth: 0 }}>
            <ScoresHeader
              date={date}
              onDate={setDate}
              division={division}
              onDivision={setDivision}
              search={search}
              onSearch={setSearch}
              filter={filter}
              onFilter={setFilter}
              counts={counts}
              panelOpen={panelOpen}
              onTogglePanel={() => setPanelOpen((open) => !open)}
            />
            {errorBanner}
            <Stack direction="row" className="results-heading">
              <span>{resultsLabel}</span>
              <span>{resultCount}</span>
            </Stack>
            <GameGrid
              games={visible}
              compact={panelOpen}
              loading={loading}
              hasLoaded={updatedAt !== null}
              hasError={Boolean(error)}
              pinnedOnly={filter === "pinned"}
              favoriteIds={favorites.ids}
              onToggleFavorite={favorites.toggle}
            />
          </Stack>
          {leaguePanel}
        </Box>
        <Footer />
      </Box>
    </Container>
  );
};

export default App;

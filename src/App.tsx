import { useState } from "react";
import { espnSource } from "./data/espn";
import type { Division, ScoreboardSource } from "./data/types";
import { useScoreboard } from "./hooks/useScoreboard";
import { useFavorites } from "./hooks/useFavorites";
import { GameCard } from "./components/GameCard";
import { EmptyState } from "./components/EmptyState";
import { ErrorBanner } from "./components/ErrorBanner";
import { LoadingGrid } from "./components/LoadingGrid";
import { SyncControls } from "./components/SyncControls";
import { Toolbar, type Filter } from "./components/Toolbar";
import { localDate } from "./utils/date";
import MastHead from "./components/MastHead";

const App = ({ source = espnSource }: { source?: ScoreboardSource }) => {
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
  const day = new Date(`${date}T12:00:00`);
  const dayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(day);
  const errorBanner = error ? (
    <ErrorBanner message={error} loading={loading} onRetry={refresh} />
  ) : null;
  const resultsLabel =
    filter === "pinned"
      ? "YOUR WATCHLIST"
      : filter === "live"
        ? "ON THE FIELD"
        : "AROUND THE LEAGUE";
  const resultUnit = visible.length === 1 ? "game" : "games";
  const searchLabel = search ? ` matching “${search}”` : "";
  const resultCount = `${visible.length} ${resultUnit}${searchLabel}`;
  const emptyTitle =
    error && !updatedAt
      ? "The feed is taking a timeout."
      : filter === "pinned"
        ? "Your watchlist starts here."
        : "No games on this field.";
  const emptyDetail =
    error && !updatedAt
      ? "Try refreshing to reconnect to ESPN."
      : filter === "pinned"
        ? "Use the star on a game to pin it to the top of your scoreboard."
        : "Try another date, division, or filter.";
  const cards = visible.map((game) => (
    <GameCard
      key={game.id}
      game={game}
      favorite={pinned(game.id)}
      onFavorite={() => favorites.toggle(game.id)}
    />
  ));
  let content = <EmptyState title={emptyTitle} detail={emptyDetail} />;

  if (loading && !updatedAt) content = <LoadingGrid />;
  else if (visible.length)
    content = (
      <section className="game-grid" aria-label="College football games">
        {cards}
      </section>
    );

  return (
    <div className="app-shell">
      <MastHead division={division} />
      <main>
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE SCOREBOARD</span>
            <h2>
              {dayLabel}
              <span className="year"> {day.getFullYear()}</span>
            </h2>
          </div>
          <SyncControls
            loading={loading}
            paused={paused}
            error={error}
            updatedAt={updatedAt}
            onTogglePause={() => setPaused((p) => !p)}
            onRefresh={refresh}
          />
        </div>
        <Toolbar
          date={date}
          onDate={setDate}
          division={division}
          onDivision={setDivision}
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
          counts={counts}
        />
        {errorBanner}
        <div className="results-heading">
          <span>{resultsLabel}</span>
          <span>{resultCount}</span>
        </div>
        {content}
        <footer>
          <span className="footer-brand">
            SATURDAY<span> SCOREBOARD</span>
          </span>
          <p>
            Data from ESPN · Refreshes every 20s · Clocks reflect the latest
            feed update
          </p>
          <span>Independent project. Not affiliated with ESPN.</span>
        </footer>
      </main>
    </div>
  );
};

export default App;

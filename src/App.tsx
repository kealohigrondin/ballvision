import { AppDataProvider } from "./components/AppDataProvider";
import { Dashboard } from "./components/Dashboard";
import type { LeagueSource, ScoreboardSource } from "./data/types";

type AppProps = { source?: ScoreboardSource; leagueSource?: LeagueSource };

const App = ({ source, leagueSource }: AppProps) => (
  <AppDataProvider source={source} leagueSource={leagueSource}>
    <Dashboard />
  </AppDataProvider>
);

export default App;

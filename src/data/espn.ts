import type { Game, GameState, ScoreboardSource, Team } from './types';

type Json = Record<string, unknown>;
const obj = (value: unknown): Json => value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const str = (value: unknown, fallback = '') => typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
const number = (value: unknown): number | undefined => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const image = (value: unknown) => {
  const url = str(value);
  return /^https:\/\/(?:a|a[0-9])\.espncdn\.com\//.test(url) ? url : undefined;
};
function team(raw: Json): Team {
  const t = obj(raw.team);
  const rank = number(obj(raw.curatedRank).current);
  return {
    id: str(raw.id), name: str(t.shortDisplayName, str(t.displayName, 'Unknown team')),
    abbreviation: str(t.abbreviation), logo: image(t.logo),
    color: /^[0-9a-f]{6}$/i.test(str(t.color)) ? `#${t.color}` : '#a6b99d',
    score: str(raw.score, '—'), rank: rank && rank <= 25 ? rank : undefined,
    record: str(obj(list(raw.records).find(r => obj(r).type === 'total')).summary),
    conferenceId: str(t.conferenceId),
    quarters: list(raw.linescores).map(q => str(obj(q).displayValue, str(obj(q).value, '—'))),
  };
}
export function parseScoreboard(payload: unknown): Game[] {
  const root = obj(payload);
  if (!Array.isArray(root.events)) throw new Error('Unexpected ESPN response.');
  const games: Game[] = [];
  for (const raw of root.events) {
    const e = obj(raw), c = obj(list(e.competitions)[0]);
    const teams = list(c.competitors).map(obj);
    const home = teams.find(t => t.homeAway === 'home');
    const away = teams.find(t => t.homeAway === 'away');
    if (!e.id || !home || !away) continue;
    const status = obj(e.status ?? c.status), type = obj(status.type), s = obj(c.situation);
    const state: GameState = type.completed === true || type.state === 'post' ? 'final'
      : type.state === 'in' ? 'live'
      : type.state === 'pre' && ['STATUS_SCHEDULED', 'STATUS_PREGAME'].includes(str(type.name)) ? 'upcoming' : 'other';
    games.push({
      id: str(e.id), home: team(home), away: team(away), state,
      status: str(type.detail, str(type.description, 'Scheduled')),
      clock: str(status.displayClock), period: number(status.period) ?? 0,
      start: str(e.date), broadcast: list(c.broadcasts).flatMap(b => list(obj(b).names)).map(n => str(n)).join(' / '),
      venue: str(obj(c.venue).fullName), possession: str(s.possession),
      situation: str(s.downDistanceText, str(s.shortDownDistanceText)),
      lastPlay: str(obj(s.lastPlay).text), redZone: s.isRedZone === true,
      homeTimeouts: number(s.homeTimeouts), awayTimeouts: number(s.awayTimeouts),
    });
  }
  return games.sort((a, b) => {
    const priority = { live: 0, upcoming: 1, other: 2, final: 3 };
    return priority[a.state] - priority[b.state] || (Date.parse(a.start) || 0) - (Date.parse(b.start) || 0);
  });
}
export const espnSource: ScoreboardSource = {
  async load(query, signal) {
    const url = new URL('https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard');
    url.search = new URLSearchParams({ groups: query.division === 'fbs' ? '80' : '81',
      limit: '1000', dates: query.date.replaceAll('-', '') }).toString();
    const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`ESPN returned HTTP ${response.status}.`);
    return parseScoreboard(await response.json());
  },
};

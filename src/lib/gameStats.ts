export interface GameRecord {
  id: string;
  date: string;
  opponent: string;
  result: 'win' | 'loss' | 'draw';
  moves: number;
  mode: 'vs-ai' | 'local';
  timeControl?: string;
  difficulty?: string;
}

export interface Stats {
  games: GameRecord[];
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
}

const STORAGE_KEY = 'chess-stats';

const defaultStats = (): Stats => ({
  games: [],
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
});

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Stats;
  } catch {}
  return defaultStats();
}

export function saveResult(record: Omit<GameRecord, 'id' | 'date'>): void {
  const stats = loadStats();
  const newRecord: GameRecord = {
    ...record,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };

  stats.totalGames++;
  if (record.result === 'win') {
    stats.wins++;
    stats.currentStreak++;
  } else if (record.result === 'loss') {
    stats.losses++;
    stats.currentStreak = 0;
  } else {
    stats.draws++;
    stats.currentStreak = 0;
  }
  stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
  stats.games.push(newRecord);

  // Keep last 100 games
  if (stats.games.length > 100) stats.games = stats.games.slice(-100);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

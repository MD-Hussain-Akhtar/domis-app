import { GameState, SavedMatch, PlayerStats, Language, ScoringRule } from '../types';

const STORAGE_KEY_CURRENT_GAME = 'dominoes_current_game_v2';
const STORAGE_KEY_MATCHES = 'dominoes_matches';
const STORAGE_KEY_SETTINGS = 'dominoes_settings_v2';
const STORAGE_KEY_RECENT_PLAYERS = 'dominoes_recent_players';

export interface AppSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  language: Language;
  defaultTargetScore: number;
  defaultScoringRule: ScoringRule;
}

export const defaultSettings: AppSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  language: 'en',
  defaultTargetScore: 100,
  defaultScoringRule: 'penalty',
};

// Current Active Game
export function saveCurrentGame(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_GAME, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save current game to storage', e);
  }
}

export function loadCurrentGame(): GameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_GAME);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load current game', e);
    return null;
  }
}

export function clearCurrentGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CURRENT_GAME);
  } catch (e) {
    console.error('Failed to clear current game', e);
  }
}

// Matches History
export function loadMatchesHistory(): SavedMatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATCHES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to load matches history', e);
    return [];
  }
}

export function saveMatchRecord(match: SavedMatch): void {
  try {
    const list = loadMatchesHistory();
    // Prepend to top
    const updated = [match, ...list.filter((m) => m.id !== match.id)];
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(updated));
    recordPlayerNames(match.players.map((p) => p.name));
  } catch (e) {
    console.error('Failed to save match', e);
  }
}

export function deleteMatchRecord(id: string): SavedMatch[] {
  try {
    const list = loadMatchesHistory();
    const updated = list.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEY_MATCHES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete match', e);
    return [];
  }
}

export function clearAllMatchesHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_MATCHES);
  } catch (e) {
    console.error('Failed to clear matches history', e);
  }
}

// Settings
export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// Recent Player Names Autocomplete
export function loadRecentPlayerNames(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_PLAYERS);
    if (!raw) return ['P1', 'P2', 'P3', 'P4'];
    return JSON.parse(raw);
  } catch {
    return ['P1', 'P2', 'P3', 'P4'];
  }
}

export function recordPlayerNames(names: string[]): void {
  try {
    const existing = new Set(loadRecentPlayerNames());
    names.forEach((n) => {
      if (n.trim()) existing.add(n.trim());
    });
    localStorage.setItem(STORAGE_KEY_RECENT_PLAYERS, JSON.stringify(Array.from(existing).slice(0, 20)));
  } catch {
    // Ignore
  }
}

// Player Career Stats Calculation
export function calculatePlayerStats(matches: SavedMatch[]): PlayerStats[] {
  const map: Record<string, PlayerStats> = {};

  matches.forEach((match) => {
    match.players.forEach((player) => {
      const name = player.name.trim() || 'Unknown';
      if (!map[name]) {
        map[name] = {
          name,
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          totalPoints: 0,
          bestLowScore: Infinity,
          lastPlayed: match.timestamp,
        };
      }

      const st = map[name];
      st.matchesPlayed += 1;
      const score = match.finalTotals[player.id] ?? 0;
      st.totalPoints += score;
      if (score < st.bestLowScore) {
        st.bestLowScore = score;
      }
      if (match.timestamp > st.lastPlayed) {
        st.lastPlayed = match.timestamp;
      }

      // Check if won
      const isWinner = match.winnerNames.toLowerCase().includes(name.toLowerCase());
      const isLoser = match.loserNames.toLowerCase().includes(name.toLowerCase());

      if (isWinner) st.wins += 1;
      if (isLoser) st.losses += 1;
    });
  });

  return Object.values(map)
    .map((s) => ({
      ...s,
      bestLowScore: s.bestLowScore === Infinity ? 0 : s.bestLowScore,
    }))
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
}

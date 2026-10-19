export type GameMode = 'individual' | 'teams';

export type ScoringRule = 'penalty' | 'race';
// penalty: 100 points cutoff. Players accumulate points of unplayed tiles. First to >= 100 loses. Lowest score wins.
// race: First player to reach 100 points by winning rounds and adding points wins.

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  team?: 1 | 2; // For 2v2 team games
}

export interface RoundRecord {
  roundNumber: number;
  timestamp: number;
  scores: Record<string, number>; // playerId -> round points
  winnerId?: string; // Player who played out ("Domino!")
  notes?: string;
}

export interface GameState {
  id: string;
  startTime: number;
  mode: GameMode;
  scoringRule: ScoringRule;
  targetScore: number; // default 100
  players: Player[];
  rounds: RoundRecord[];
  isGameOver: boolean;
  winnerIds: string[];
  loserIds: string[];
  endReason?: string;
}

export interface SavedMatch {
  id: string;
  date: string;
  timestamp: number;
  mode: GameMode;
  scoringRule: ScoringRule;
  targetScore: number;
  durationMinutes: number;
  players: { id: string; name: string; avatarColor: string; team?: 1 | 2 }[];
  rounds: RoundRecord[];
  finalTotals: Record<string, number>;
  winnerNames: string;
  loserNames: string;
  winnerScore: number;
  summaryText: string;
}

export interface PlayerStats {
  name: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalPoints: number;
  bestLowScore: number;
  lastPlayed: number;
}

export type AppTab = 'game' | 'rounds' | 'history' | 'stats' | 'rules';

export type Language = 'en' | 'ur';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  History,
  RotateCcw,
  PlusCircle,
  Settings,
  Calculator,
  BookOpen,
  Sparkles,
  BarChart3,
  Check,
  AlertTriangle,
  PlayCircle,
  Table as TableIcon
} from 'lucide-react';
import {
  GameState,
  Player,
  RoundRecord,
  SavedMatch,
  AppTab,
  Language,
  GameMode,
  ScoringRule,
} from './types';
import { t } from './utils/translations';
import { sounds } from './utils/sound';
import {
  loadCurrentGame,
  saveCurrentGame,
  clearCurrentGame,
  loadMatchesHistory,
  saveMatchRecord,
  deleteMatchRecord,
  clearAllMatchesHistory,
  loadSettings,
  saveSettings,
  calculatePlayerStats,
  recordPlayerNames,
} from './utils/storage';
import { ScoreBoardTable } from './components/ScoreBoardTable';
import { GameOverModal } from './components/GameOverModal';
import { EditRoundModal } from './components/EditRoundModal';
import { QuickPipCalculator } from './components/QuickPipCalculator';
import { GameSetupModal } from './components/GameSetupModal';
import { HistoryView } from './components/HistoryView';
import { PlayerStatsModal } from './components/PlayerStatsModal';
import { RulesGuideModal } from './components/RulesGuideModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

const INITIAL_PLAYERS: Player[] = [
  { id: 'p0', name: 'P1', avatarColor: '#3b82f6' },
  { id: 'p1', name: 'P2', avatarColor: '#10b981' },
  { id: 'p2', name: 'P3', avatarColor: '#f59e0b' },
  { id: 'p3', name: 'P4', avatarColor: '#ec4899' },
];

export default function App() {
  const [settings, setSettingsState] = useState(loadSettings);
  const [activeTab, setActiveTab] = useState<AppTab>('game');

  // Active game state
  const [game, setGame] = useState<GameState>(() => {
    const saved = loadCurrentGame();
    if (saved) return saved;

    return {
      id: `game-${Date.now()}`,
      startTime: Date.now(),
      mode: 'individual',
      scoringRule: settings.defaultScoringRule || 'penalty',
      targetScore: settings.defaultTargetScore || 100,
      players: INITIAL_PLAYERS,
      rounds: [],
      isGameOver: false,
      winnerIds: [],
      loserIds: [],
    };
  });

  // Current round inputs
  const [roundInputs, setRoundInputs] = useState<Record<string, string>>({
    p0: '',
    p1: '',
    p2: '',
    p3: '',
  });

  // History list
  const [history, setHistory] = useState<SavedMatch[]>(loadMatchesHistory);

  // Modals state
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [editingRound, setEditingRound] = useState<RoundRecord | null>(null);
  const [pipCalcPlayer, setPipCalcPlayer] = useState<Player | null>(null);

  // Keep sounds config synced
  useEffect(() => {
    sounds.setSoundEnabled(settings.soundEnabled);
    sounds.setHapticsEnabled(settings.hapticsEnabled);
  }, [settings.soundEnabled, settings.hapticsEnabled]);

  // Persist game state automatically
  useEffect(() => {
    saveCurrentGame(game);
  }, [game]);

  // Check game over on load or when rounds change
  const currentRoundNum = game.rounds.length + 1;

  // Compute live totals
  const totals: Record<string, number> = {};
  game.players.forEach((p) => {
    totals[p.id] = 0;
  });
  game.rounds.forEach((round) => {
    Object.entries(round.scores).forEach(([pId, score]) => {
      totals[pId] = (totals[pId] || 0) + score;
    });
  });

  // Check if someone hit target
  const hasLost = game.players.some((p) => (totals[p.id] || 0) >= game.targetScore);

  // Handle Score Input
  const handleInputChange = (playerId: string, val: string) => {
    setRoundInputs((prev) => ({
      ...prev,
      [playerId]: val,
    }));
  };

  // Quick set 0 (Domino Win)
  const handleSetZero = (playerId: string) => {
    sounds.playTileThud();
    setRoundInputs((prev) => ({
      ...prev,
      [playerId]: '0',
    }));
  };

  // Quick add points to input
  const handleQuickAddPoints = (playerId: string, amount: number) => {
    sounds.playClick();
    const currentVal = parseInt(roundInputs[playerId] || '0', 10) || 0;
    setRoundInputs((prev) => ({
      ...prev,
      [playerId]: String(currentVal + amount),
    }));
  };

  // Add Round
  const handleAddRound = () => {
    if (game.isGameOver) return;

    // Collect scores
    const newScores: Record<string, number> = {};
    let allEmpty = true;

    game.players.forEach((p) => {
      const raw = roundInputs[p.id];
      if (raw !== undefined && raw.trim() !== '') {
        allEmpty = false;
      }
      const num = parseInt(raw || '0', 10);
      newScores[p.id] = isNaN(num) ? 0 : Math.max(0, num);
    });

    if (allEmpty) {
      alert(settings.language === 'ur' ? 'برائے مہربانی پوائنٹس درج کریں!' : 'Please enter points for players!');
      return;
    }

    const newRound: RoundRecord = {
      roundNumber: currentRoundNum,
      timestamp: Date.now(),
      scores: newScores,
    };

    const updatedRounds = [...game.rounds, newRound];

    // Recalculate totals with new round
    const newTotals: Record<string, number> = { ...totals };
    let isNowOver = false;
    const overPlayers: string[] = [];

    game.players.forEach((p) => {
      newTotals[p.id] = (newTotals[p.id] || 0) + (newScores[p.id] || 0);
      if (newTotals[p.id] >= game.targetScore) {
        isNowOver = true;
        overPlayers.push(p.id);
      }
    });

    // Clear inputs
    const clearedInputs: Record<string, string> = {};
    game.players.forEach((p) => {
      clearedInputs[p.id] = '';
    });
    setRoundInputs(clearedInputs);

    if (isNowOver) {
      sounds.playDangerWarning();

      // Determine winner (lowest points in penalty mode)
      let minScore = Infinity;
      let winnerId = game.players[0].id;
      game.players.forEach((p) => {
        if (newTotals[p.id] < minScore) {
          minScore = newTotals[p.id];
          winnerId = p.id;
        }
      });

      const updatedGame: GameState = {
        ...game,
        rounds: updatedRounds,
        isGameOver: true,
        winnerIds: [winnerId],
        loserIds: overPlayers,
      };

      setGame(updatedGame);
      saveGameToHistory(updatedGame, newTotals);
      setShowGameOver(true);
    } else {
      sounds.playRoundAdded();
      setGame((prev) => ({
        ...prev,
        rounds: updatedRounds,
      }));
    }
  };

  // Save finished match to history
  const saveGameToHistory = (completedGame: GameState, finalTotals: Record<string, number>) => {
    const winnerPlayer = completedGame.players.find((p) => completedGame.winnerIds.includes(p.id));
    const loserPlayers = completedGame.players.filter((p) => completedGame.loserIds.includes(p.id));

    const winnerName = winnerPlayer?.name || 'P1';
    const loserNames = loserPlayers.map((l) => l.name).join(', ') || 'None';
    const winnerScore = finalTotals[winnerPlayer?.id || ''] ?? 0;

    const summary = completedGame.players
      .map((p) => `${p.name}: ${finalTotals[p.id] || 0}`)
      .join(' | ');

    const record: SavedMatch = {
      id: `match-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: Date.now(),
      mode: completedGame.mode,
      scoringRule: completedGame.scoringRule,
      targetScore: completedGame.targetScore,
      durationMinutes: Math.max(1, Math.round((Date.now() - completedGame.startTime) / 60000)),
      players: completedGame.players,
      rounds: completedGame.rounds,
      finalTotals,
      winnerNames: winnerName,
      loserNames,
      winnerScore,
      summaryText: `🁓 Dominoes Match: Winner: ${winnerName} (${winnerScore} pts) | 100+ Loser: ${loserNames} | [${summary}]`,
    };

    saveMatchRecord(record);
    setHistory(loadMatchesHistory());
  };

  // Undo Last Round
  const handleUndoRound = () => {
    if (game.rounds.length === 0) return;
    sounds.playClick();

    const updatedRounds = game.rounds.slice(0, -1);
    setGame((prev) => ({
      ...prev,
      rounds: updatedRounds,
      isGameOver: false,
      winnerIds: [],
      loserIds: [],
    }));
    setShowGameOver(false);
  };

  // Start New Game
  const handleStartNewGame = () => {
    sounds.playClick();
    if (game.rounds.length > 0 && !game.isGameOver) {
      const confirmReset = window.confirm(
        settings.language === 'ur'
          ? 'کیا آپ نیا میچ شروع کرنا چاہتے ہیں؟ موجودہ راؤنڈز ختم ہو جائیں گے۔'
          : 'Start a new match? Current uncompleted rounds will be cleared.'
      );
      if (!confirmReset) return;
    }

    const newGame: GameState = {
      id: `game-${Date.now()}`,
      startTime: Date.now(),
      mode: game.mode,
      scoringRule: game.scoringRule,
      targetScore: game.targetScore,
      players: game.players,
      rounds: [],
      isGameOver: false,
      winnerIds: [],
      loserIds: [],
    };

    setGame(newGame);
    clearCurrentGame();
    setShowGameOver(false);

    const clearedInputs: Record<string, string> = {};
    game.players.forEach((p) => {
      clearedInputs[p.id] = '';
    });
    setRoundInputs(clearedInputs);
    setActiveTab('game');
  };

  // Rematch with same players
  const handleRematch = () => {
    sounds.playClick();
    const newGame: GameState = {
      id: `game-${Date.now()}`,
      startTime: Date.now(),
      mode: game.mode,
      scoringRule: game.scoringRule,
      targetScore: game.targetScore,
      players: game.players,
      rounds: [],
      isGameOver: false,
      winnerIds: [],
      loserIds: [],
    };
    setGame(newGame);
    setShowGameOver(false);
    setActiveTab('game');
  };

  // Rematch from historical match card
  const handleRematchFromHistory = (histMatch: SavedMatch) => {
    sounds.playClick();
    const newGame: GameState = {
      id: `game-${Date.now()}`,
      startTime: Date.now(),
      mode: histMatch.mode,
      scoringRule: histMatch.scoringRule,
      targetScore: histMatch.targetScore,
      players: histMatch.players,
      rounds: [],
      isGameOver: false,
      winnerIds: [],
      loserIds: [],
    };
    setGame(newGame);
    setActiveTab('game');
  };

  // Save edited round
  const handleSaveEditedRound = (updatedScores: Record<string, number>) => {
    if (!editingRound) return;

    const updatedRounds = game.rounds.map((r) =>
      r.roundNumber === editingRound.roundNumber ? { ...r, scores: updatedScores } : r
    );

    // Recalculate totals
    const newTotals: Record<string, number> = {};
    game.players.forEach((p) => {
      newTotals[p.id] = 0;
    });
    updatedRounds.forEach((r) => {
      Object.entries(r.scores).forEach(([pId, score]) => {
        newTotals[pId] = (newTotals[pId] || 0) + score;
      });
    });

    const isBusted = game.players.some((p) => (newTotals[p.id] || 0) >= game.targetScore);

    setGame((prev) => ({
      ...prev,
      rounds: updatedRounds,
      isGameOver: isBusted,
    }));

    setEditingRound(null);
  };

  // Delete round
  const handleDeleteRound = () => {
    if (!editingRound) return;

    const remainingRounds = game.rounds
      .filter((r) => r.roundNumber !== editingRound.roundNumber)
      .map((r, idx) => ({ ...r, roundNumber: idx + 1 }));

    setGame((prev) => ({
      ...prev,
      rounds: remainingRounds,
      isGameOver: false,
    }));

    setEditingRound(null);
  };

  // Save Settings from Setup Modal
  const handleSaveSetup = (params: {
    players: Player[];
    mode: GameMode;
    targetScore: number;
    scoringRule: ScoringRule;
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    lang: Language;
  }) => {
    const updatedSettings = {
      ...settings,
      soundEnabled: params.soundEnabled,
      hapticsEnabled: params.hapticsEnabled,
      language: params.lang,
      defaultTargetScore: params.targetScore,
      defaultScoringRule: params.scoringRule,
    };

    setSettingsState(updatedSettings);
    saveSettings(updatedSettings);

    recordPlayerNames(params.players.map((p) => p.name));

    // Reset current game with new players & target
    setGame({
      id: `game-${Date.now()}`,
      startTime: Date.now(),
      mode: params.mode,
      scoringRule: params.scoringRule,
      targetScore: params.targetScore,
      players: params.players,
      rounds: [],
      isGameOver: false,
      winnerIds: [],
      loserIds: [],
    });

    const newInputs: Record<string, string> = {};
    params.players.forEach((p) => {
      newInputs[p.id] = '';
    });
    setRoundInputs(newInputs);

    setShowSetupModal(false);
  };

  // Delete individual match from history
  const handleDeleteMatch = (id: string) => {
    sounds.playDangerWarning();
    const updated = deleteMatchRecord(id);
    setHistory(updated);
  };

  // Clear all matches
  const handleClearAllHistory = () => {
    if (window.confirm(t('clearHistoryConfirm', settings.language))) {
      sounds.playDangerWarning();
      clearAllMatchesHistory();
      setHistory([]);
    }
  };

  // Quick player rename right from header
  const handlePlayerNameChange = (playerId: string, newName: string) => {
    setGame((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, name: newName || p.name } : p
      ),
    }));
  };

  const playerStats = calculatePlayerStats(history);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 md:pb-8">
      {/* Top Bar Contract (1-Row, 3-Zones: Brand Wordmark | Nav Links | Primary Action) */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 font-display">
            🁓
          </div>
          <div>
            <h1 className="text-base md:text-lg font-extrabold tracking-tight text-white font-display whitespace-nowrap">
              {t('appTitle', settings.language)}
            </h1>
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
              {game.targetScore} {t('targetScore', settings.language)}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setActiveTab('game')}
            className={`transition whitespace-nowrap ${
              activeTab === 'game' ? 'text-amber-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t('liveMatch', settings.language)}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`transition whitespace-nowrap ${
              activeTab === 'history' ? 'text-amber-400 font-bold' : 'hover:text-white'
            }`}
          >
            {t('history', settings.language)} ({history.length})
          </button>
          <button
            onClick={() => setShowStatsModal(true)}
            className="hover:text-white transition whitespace-nowrap"
          >
            {t('playerStats', settings.language)}
          </button>
          <button
            onClick={() => setShowRulesModal(true)}
            className="hover:text-white transition whitespace-nowrap"
          >
            {t('rulesGuide', settings.language)}
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setShowSetupModal(true);
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition"
            title="Game Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleStartNewGame}
            className="py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition whitespace-nowrap"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{t('newGame', settings.language)}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4">
        {/* PWA Install Banner */}
        <PWAInstallPrompt lang={settings.language} />

        {/* Status / Game Over Alert Banner (just like user's alertbox, elevated) */}
        {game.isGameOver && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-600/70 shadow-lg text-center animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{t('gameOver', settings.language)}</span>
            </div>
            <div className="text-sm font-semibold text-white">
              {settings.language === 'ur' ? 'ہارنے والا (100+ پہنچ گیا):' : 'Busted Player (100+):'}{' '}
              <strong className="text-rose-300">
                {game.players
                  .filter((p) => (totals[p.id] || 0) >= game.targetScore)
                  .map((p) => `${p.name} (${totals[p.id]} pts)`)
                  .join(', ')}
              </strong>
            </div>
            <div className="text-sm font-semibold text-amber-300 mt-1">
              {settings.language === 'ur' ? 'جیتنے والا (کم پوائنٹس):' : 'Winner (Lowest Pts):'}{' '}
              <strong className="text-amber-400 underline">
                {game.players
                  .filter((p) => game.winnerIds.includes(p.id))
                  .map((p) => `${p.name} (${totals[p.id]} pts)`)
                  .join(', ')}
              </strong>
            </div>
            <div className="mt-3 flex justify-center gap-2">
              <button
                onClick={() => setShowGameOver(true)}
                className="py-1.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                {settings.language === 'ur' ? 'مکمل نتائج دیکھیں' : 'View Full Ceremony'}
              </button>
              <button
                onClick={handleUndoRound}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('undoRound', settings.language)}
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Live Game View */}
        {activeTab === 'game' && (
          <div className="space-y-4">
            {/* Live Progress & Total Score Cards */}
            <ScoreBoardTable
              players={game.players}
              rounds={game.rounds}
              totals={totals}
              targetScore={game.targetScore}
              scoringRule={game.scoringRule}
              lang={settings.language}
              onEditRound={(round) => setEditingRound(round)}
            />

            {/* Round Entry Card (Ergonomic Touch Inputs) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-sm sm:text-base font-extrabold text-white font-display">
                    {t('round', settings.language)} {currentRoundNum} {t('points', settings.language)}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  {game.rounds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUndoRound}
                      className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                      title="Undo last round"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">{t('undoRound', settings.language)}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Player Score Inputs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {game.players.map((p) => {
                  const val = roundInputs[p.id] || '';
                  const numVal = parseInt(val, 10);
                  const isZero = val === '0';

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col justify-between"
                    >
                      {/* Player Label and Domino Button */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: p.avatarColor }}
                          />
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => handlePlayerNameChange(p.id, e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-200 w-16 focus:bg-slate-800 focus:outline-none rounded px-1"
                            title="Edit player name"
                          />
                        </div>

                        {/* Pip Calculator trigger for this player */}
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setPipCalcPlayer(p);
                          }}
                          className="p-1 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition"
                          title="Open Pip Calculator"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Main Number Input */}
                      <div className="relative my-1">
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={roundInputs[p.id]}
                          onChange={(e) => handleInputChange(p.id, e.target.value)}
                          disabled={game.isGameOver}
                          className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-center font-black text-xl text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 disabled:opacity-50 tabular-nums font-display"
                        />
                      </div>

                      {/* Quick Point Steppers (0 / Domino, +5, +10) */}
                      <div className="grid grid-cols-3 gap-1 mt-2">
                        <button
                          type="button"
                          onClick={() => handleSetZero(p.id)}
                          className={`py-1 rounded-lg text-[10px] font-bold border transition ${
                            isZero
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-800'
                          }`}
                          title="Domino winner! 0 points"
                        >
                          0 🁓
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAddPoints(p.id, 5)}
                          className="py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-800 transition"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAddPoints(p.id, 10)}
                          className="py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-[10px] border border-slate-800 transition"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Round Primary Button */}
              <div className="mt-4 pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddRound}
                  disabled={game.isGameOver}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition cursor-pointer"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>
                    {t('addRound', settings.language)} #{currentRoundNum}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: History View */}
        {activeTab === 'history' && (
          <HistoryView
            matches={history}
            lang={settings.language}
            onDeleteMatch={handleDeleteMatch}
            onClearAll={handleClearAllHistory}
            onRematchPlayers={handleRematchFromHistory}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 pb-safe md:hidden">
        <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto">
          {/* Tab 1: Live Game */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('game');
            }}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'game' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight mt-1">
              {t('scoreboard', settings.language)}
            </span>
          </button>

          {/* Tab 2: History */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab('history');
            }}
            className={`flex flex-col items-center justify-center py-1 transition ${
              activeTab === 'history' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight mt-1">
              {t('history', settings.language)}
            </span>
          </button>

          {/* Tab 3: Player Stats */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowStatsModal(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight mt-1">
              {t('playerStats', settings.language)}
            </span>
          </button>

          {/* Tab 4: Rules / Settings */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowSetupModal(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-white transition"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight mt-1">
              {settings.language === 'ur' ? 'سیٹنگز' : 'Settings'}
            </span>
          </button>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Game Over Celebration Modal */}
      {showGameOver && (
        <GameOverModal
          game={game}
          lang={settings.language}
          onRematch={handleRematch}
          onClose={() => setShowGameOver(false)}
        />
      )}

      {/* 2. Edit Round Modal */}
      {editingRound && (
        <EditRoundModal
          round={editingRound}
          players={game.players}
          lang={settings.language}
          onSave={handleSaveEditedRound}
          onDelete={handleDeleteRound}
          onClose={() => setEditingRound(null)}
        />
      )}

      {/* 3. Pip Calculator Sheet */}
      {pipCalcPlayer && (
        <QuickPipCalculator
          playerName={pipCalcPlayer.name}
          lang={settings.language}
          onApplyScore={(score) => {
            setRoundInputs((prev) => ({
              ...prev,
              [pipCalcPlayer.id]: String(score),
            }));
          }}
          onClose={() => setPipCalcPlayer(null)}
        />
      )}

      {/* 4. Game Setup & Rules Modal */}
      {showSetupModal && (
        <GameSetupModal
          currentPlayers={game.players}
          currentMode={game.mode}
          currentTargetScore={game.targetScore}
          currentScoringRule={game.scoringRule}
          soundEnabled={settings.soundEnabled}
          hapticsEnabled={settings.hapticsEnabled}
          lang={settings.language}
          onSaveSetup={handleSaveSetup}
          onClose={() => setShowSetupModal(false)}
        />
      )}

      {/* 5. Player Lifetime Stats Modal */}
      {showStatsModal && (
        <PlayerStatsModal
          stats={playerStats}
          lang={settings.language}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {/* 6. Rules Guide Modal */}
      {showRulesModal && (
        <RulesGuideModal
          lang={settings.language}
          onClose={() => setShowRulesModal(false)}
        />
      )}
    </div>
  );
}

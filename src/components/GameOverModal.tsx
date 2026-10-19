import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, AlertOctagon, Share2, Check, RefreshCw, X } from 'lucide-react';
import { GameState, Language } from '../types';
import { t } from '../utils/translations';
import { sounds } from '../utils/sound';

interface GameOverModalProps {
  game: GameState;
  lang: Language;
  onRematch: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  game,
  lang,
  onRematch,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute final totals
  const totals: Record<string, number> = {};
  game.players.forEach((p) => {
    totals[p.id] = 0;
  });
  game.rounds.forEach((round) => {
    Object.entries(round.scores).forEach(([pId, score]) => {
      totals[pId] = (totals[pId] || 0) + score;
    });
  });

  // Sort players: in penalty cutoff, lowest score is 1st place!
  const sortedPlayers = [...game.players].sort((a, b) => {
    if (game.scoringRule === 'penalty') {
      return (totals[a.id] || 0) - (totals[b.id] || 0);
    }
    return (totals[b.id] || 0) - (totals[a.id] || 0);
  });

  const winner = sortedPlayers[0];
  const losers = game.players.filter((p) => (totals[p.id] || 0) >= game.targetScore);

  useEffect(() => {
    sounds.playVictoryFanfare();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 300);
    } catch {
      // Ignore if confetti fails
    }
  }, []);

  const handleShare = () => {
    sounds.playClick();
    const dateStr = new Date().toLocaleDateString();
    let text = `🁓 Dominoes Match Result (${dateStr}) 🁓\n`;
    text += `Target: ${game.targetScore} Pts | Rounds: ${game.rounds.length}\n`;
    text += `🏆 Jeetne Wala (Winner): ${winner?.name} (${totals[winner?.id || '']} pts)\n`;
    if (losers.length > 0) {
      text += `❌ Harne Wala (100+): ${losers.map((l) => `${l.name} (${totals[l.id]} pts)`).join(', ')}\n`;
    }
    text += `\nFinal Scores:\n`;
    sortedPlayers.forEach((p, idx) => {
      text += `${idx + 1}. ${p.name}: ${totals[p.id]} pts\n`;
    });
    text += `\nTracked with Dominoes Pro Score Tracker 🁓`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative flex flex-col max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Victory Header */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
            <Trophy className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black text-white font-display">
            {t('gameOver', lang)}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ur'
              ? `${game.rounds.length} راؤنڈز کے بعد میچ مکمل ہوا`
              : `Match completed in ${game.rounds.length} rounds`}
          </p>
        </div>

        {/* Winner Highlight Box */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-500/40 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
            {t('winner', lang)} ({t('lowestPoints', lang)})
          </span>
          <div className="text-2xl font-extrabold text-white font-display flex items-center justify-center gap-2">
            <span>{winner?.name}</span>
            <span className="text-amber-400 tabular-nums">
              ({totals[winner?.id || '']} {t('points', lang)})
            </span>
          </div>
        </div>

        {/* Loser / Over-Target Alert Box */}
        {losers.length > 0 && (
          <div className="mt-3 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-600/40 text-center">
            <div className="flex items-center justify-center gap-1.5 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <AlertOctagon className="w-4 h-4" />
              <span>{t('loser', lang)}</span>
            </div>
            <div className="text-base font-bold text-rose-200">
              {losers.map((l) => `${l.name} (${totals[l.id]} pts)`).join(', ')}
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            {lang === 'ur' ? 'حتمی نتائج (Final Standings):' : 'Final Standings:'}
          </h4>
          <div className="space-y-2">
            {sortedPlayers.map((player, idx) => {
              const score = totals[player.id] || 0;
              const isWin = idx === 0;
              const isBusted = score >= game.targetScore;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    isWin
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : isBusted
                      ? 'bg-rose-900/15 border-rose-800/40'
                      : 'bg-slate-800/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-sm text-white">
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-bold tabular-nums ${
                        isWin
                          ? 'text-amber-400'
                          : isBusted
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {score} {t('points', lang)}
                    </span>
                    {isBusted && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-rose-900/60 text-rose-300">
                        100+
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onRematch}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition"
          >
            <RefreshCw className="w-4 h-4" />
            {t('rematch', lang)}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-98 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{t('copiedToClipboard', lang)}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-300" />
                <span>{t('shareScore', lang)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

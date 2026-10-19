import React from 'react';
import { Trophy, Award, TrendingUp, X } from 'lucide-react';
import { PlayerStats, Language } from '../types';
import { t } from '../utils/translations';

interface PlayerStatsModalProps {
  stats: PlayerStats[];
  lang: Language;
  onClose: () => void;
}

export const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({
  stats,
  lang,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">
              {t('playerStats', lang)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto space-y-3">
          {stats.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              {t('noMatches', lang)}
            </div>
          ) : (
            stats.map((player, idx) => {
              const winRate =
                player.matchesPlayed > 0
                  ? Math.round((player.wins / player.matchesPlayed) * 100)
                  : 0;
              const avgScore =
                player.matchesPlayed > 0
                  ? Math.round(player.totalPoints / player.matchesPlayed)
                  : 0;

              return (
                <div
                  key={player.name}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white text-base">
                        {player.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-emerald-400 font-bold">
                        {player.wins}W
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-rose-400 font-bold">
                        {player.losses}L
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] uppercase text-slate-400 block">
                        {t('winRate', lang)}
                      </span>
                      <span className="font-extrabold text-white text-sm tabular-nums">
                        {winRate}%
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] uppercase text-slate-400 block">
                        {t('avgScore', lang)}
                      </span>
                      <span className="font-extrabold text-amber-400 text-sm tabular-nums">
                        {avgScore}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                      <span className="text-[10px] uppercase text-slate-400 block">
                        {lang === 'ur' ? 'بہترین اسکور' : 'Best Low'}
                      </span>
                      <span className="font-extrabold text-emerald-400 text-sm tabular-nums">
                        {player.bestLowScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

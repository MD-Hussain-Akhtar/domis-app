import React from 'react';
import { Trophy, AlertTriangle, Edit3, Sparkles } from 'lucide-react';
import { Player, RoundRecord, Language } from '../types';
import { t } from '../utils/translations';
import { sounds } from '../utils/sound';

interface ScoreBoardTableProps {
  players: Player[];
  rounds: RoundRecord[];
  totals: Record<string, number>;
  targetScore: number;
  scoringRule: 'penalty' | 'race';
  lang: Language;
  onEditRound: (round: RoundRecord) => void;
}

export const ScoreBoardTable: React.FC<ScoreBoardTableProps> = ({
  players,
  rounds,
  totals,
  targetScore,
  scoringRule,
  lang,
  onEditRound,
}) => {
  // Find current best (lowest in penalty) and busted (>= 100)
  let lowestScore = Infinity;
  let leaderId = '';
  players.forEach((p) => {
    const s = totals[p.id] ?? 0;
    if (s < lowestScore) {
      lowestScore = s;
      leaderId = p.id;
    }
  });

  return (
    <div className="space-y-4">
      {/* Visual Player Cards with Progress towards 100 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {players.map((p) => {
          const score = totals[p.id] ?? 0;
          const isLeader = rounds.length > 0 && p.id === leaderId;
          const isBusted = score >= targetScore;
          const isDanger = !isBusted && score >= targetScore * 0.75;
          const progressPercent = Math.min(100, Math.round((score / targetScore) * 100));

          return (
            <div
              key={p.id}
              className={`p-3 rounded-2xl border transition-all ${
                isBusted
                  ? 'bg-rose-950/40 border-rose-600/60 shadow-sm shadow-rose-950/30'
                  : isLeader
                  ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-950/20'
                  : isDanger
                  ? 'bg-amber-950/20 border-amber-600/40'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              {/* Player Header */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  />
                  <span className="text-xs font-bold text-white truncate">
                    {p.name}
                  </span>
                </div>

                {isLeader && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    <Trophy className="w-2.5 h-2.5" />
                    {lang === 'ur' ? 'لیڈ' : 'Lead'}
                  </span>
                )}
                {isBusted && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-300 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    100+
                  </span>
                )}
              </div>

              {/* Big Score Number */}
              <div className="flex items-baseline justify-between mt-1">
                <span
                  className={`text-3xl font-black font-display tabular-nums tracking-tight ${
                    isBusted
                      ? 'text-rose-400'
                      : isLeader
                      ? 'text-emerald-400'
                      : isDanger
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {score}
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase">
                  / {targetScore}
                </span>
              </div>

              {/* Progress Bar Towards 100 Cutoff */}
              <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isBusted
                      ? 'bg-rose-500'
                      : isDanger
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Rounds Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-sm">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
              {t('scoreboard', lang)} ({rounds.length} {t('round', lang)})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            {lang === 'ur' ? 'راؤنڈ ایڈٹ کرنے کیلئے ٹیپ کریں' : 'Tap any row to edit or delete'}
          </span>
        </div>

        {rounds.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            {lang === 'ur'
              ? 'پہلا راؤنڈ شامل کریں، اسکور یہاں ظاہر ہوگا'
              : 'No rounds recorded yet. Enter scores below to start!'}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800">
                <tr className="text-slate-400">
                  <th className="py-2.5 px-3 font-bold w-12 text-slate-400">R#</th>
                  {players.map((p) => (
                    <th key={p.id} className="py-2.5 px-2 font-bold text-white truncate">
                      {p.name}
                    </th>
                  ))}
                  <th className="py-2.5 px-2 font-medium w-10 text-slate-500">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {rounds.map((round) => {
                  // Find minimum score in this round
                  let minRound = Infinity;
                  players.forEach((p) => {
                    const s = round.scores[p.id] ?? 0;
                    if (s < minRound) minRound = s;
                  });

                  return (
                    <tr
                      key={round.roundNumber}
                      onClick={() => {
                        sounds.playClick();
                        onEditRound(round);
                      }}
                      className="cursor-pointer hover:bg-slate-800/60 transition group active:bg-slate-800"
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-400 tabular-nums">
                        #{round.roundNumber}
                      </td>

                      {players.map((p) => {
                        const s = round.scores[p.id] ?? 0;
                        const isRoundWinner = s === 0;

                        return (
                          <td
                            key={p.id}
                            className={`py-2.5 px-2 tabular-nums font-semibold ${
                              isRoundWinner
                                ? 'text-emerald-400 font-extrabold'
                                : s >= 20
                                ? 'text-amber-300'
                                : 'text-slate-200'
                            }`}
                          >
                            <span className="inline-flex items-center gap-1 justify-center">
                              {s}
                              {isRoundWinner && (
                                <Sparkles className="w-3 h-3 text-emerald-400 inline" />
                              )}
                            </span>
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-2 text-slate-500 group-hover:text-amber-400">
                        <Edit3 className="w-3.5 h-3.5 mx-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0 bg-slate-950 border-t-2 border-slate-700 font-display">
                <tr className="font-extrabold text-amber-400 text-sm">
                  <td className="py-3 px-3 uppercase text-xs text-slate-400 font-bold">
                    {t('total', lang)}
                  </td>
                  {players.map((p) => {
                    const score = totals[p.id] ?? 0;
                    const isBusted = score >= targetScore;
                    return (
                      <td
                        key={p.id}
                        className={`py-3 px-2 tabular-nums text-base ${
                          isBusted ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {score}
                      </td>
                    );
                  })}
                  <td className="py-3 px-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Trash2, Trophy, AlertOctagon, Share2, Calendar, ChevronDown, ChevronUp, RefreshCw, Check } from 'lucide-react';
import { SavedMatch, Language } from '../types';
import { t } from '../utils/translations';
import { sounds } from '../utils/sound';

interface HistoryViewProps {
  matches: SavedMatch[];
  lang: Language;
  onDeleteMatch: (id: string) => void;
  onClearAll: () => void;
  onRematchPlayers: (match: SavedMatch) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  matches,
  lang,
  onDeleteMatch,
  onClearAll,
  onRematchPlayers,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (id: string) => {
    sounds.playClick();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleShare = (match: SavedMatch) => {
    sounds.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(match.summaryText);
      setCopiedId(match.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.winnerNames.toLowerCase().includes(term) ||
      m.loserNames.toLowerCase().includes(term) ||
      m.players.some((p) => p.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white font-display">
            {t('historyTitle', lang)}
          </h3>
          <p className="text-xs text-slate-400">
            {matches.length} {lang === 'ur' ? 'محفوظ میچز' : 'saved matches in phone storage'}
          </p>
        </div>

        {matches.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={lang === 'ur' ? 'کھلاڑی تلاش کریں...' : 'Search player...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-1.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={onClearAll}
              className="py-1.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('clearHistory', lang)}
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {matches.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-400">{t('noMatches', lang)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match, index) => {
            const isExpanded = expandedId === match.id;
            const matchNumber = matches.length - index;

            return (
              <div
                key={match.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm transition hover:border-slate-700/80"
              >
                {/* Match Header */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-display">
                      #{matchNumber}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {match.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleShare(match)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="Share / Copy"
                    >
                      {copiedId === match.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteMatch(match.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Key Outcome: Jeetne Wala & Harne Wala */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/30 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                        {t('winner', lang)} ({t('lowestPoints', lang)})
                      </div>
                      <div className="text-xs font-extrabold text-white truncate">
                        {match.winnerNames} ({match.winnerScore} {t('points', lang)})
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/30 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">
                        {t('loser', lang)}
                      </div>
                      <div className="text-xs font-extrabold text-white truncate">
                        {match.loserNames || 'None'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Player Scores Summary Badge list */}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {match.players.map((p) => {
                    const score = match.finalTotals[p.id] ?? 0;
                    const isWin = score === match.winnerScore;
                    const isBusted = score >= match.targetScore;

                    return (
                      <span
                        key={p.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
                          isWin
                            ? 'bg-emerald-900/20 border-emerald-700/40 text-emerald-300'
                            : isBusted
                            ? 'bg-rose-900/20 border-rose-700/40 text-rose-300'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: p.avatarColor }}
                        />
                        <span>{p.name}:</span>
                        <strong className="font-bold tabular-nums">{score}</strong>
                      </span>
                    );
                  })}
                </div>

                {/* Collapsible Details (Rounds Breakdown) */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => toggleExpand(match.id)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {isExpanded
                        ? lang === 'ur' ? 'راؤنڈز چھپائیں' : 'Hide Rounds'
                        : lang === 'ur' ? `${match.rounds.length} راؤنڈز تفصیل دیکھیں` : `View ${match.rounds.length} Rounds`}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => onRematchPlayers(match)}
                    className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span>{t('rematch', lang)}</span>
                  </button>
                </div>

                {/* Expanded Round Table */}
                {isExpanded && (
                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-2">
                    <table className="w-full text-xs text-center border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="p-1.5 font-bold">R#</th>
                          {match.players.map((p) => (
                            <th key={p.id} className="p-1.5 font-bold truncate">
                              {p.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {match.rounds.map((round) => (
                          <tr key={round.roundNumber} className="hover:bg-slate-900/40">
                            <td className="p-1.5 font-semibold text-slate-400">
                              {round.roundNumber}
                            </td>
                            {match.players.map((p) => {
                              const s = round.scores[p.id] ?? 0;
                              return (
                                <td
                                  key={p.id}
                                  className={`p-1.5 tabular-nums ${
                                    s === 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'
                                  }`}
                                >
                                  {s === 0 ? '0 🁓' : s}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-extrabold bg-slate-900 text-amber-300 border-t border-slate-700">
                          <td className="p-1.5">{t('total', lang)}</td>
                          {match.players.map((p) => (
                            <td key={p.id} className="p-1.5 tabular-nums">
                              {match.finalTotals[p.id] ?? 0}
                            </td>
                          ))}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

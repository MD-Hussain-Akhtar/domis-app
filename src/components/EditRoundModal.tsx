import React, { useState } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import { RoundRecord, Player, Language } from '../types';
import { t } from '../utils/translations';
import { sounds } from '../utils/sound';

interface EditRoundModalProps {
  round: RoundRecord;
  players: Player[];
  lang: Language;
  onSave: (updatedScores: Record<string, number>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const EditRoundModal: React.FC<EditRoundModalProps> = ({
  round,
  players,
  lang,
  onSave,
  onDelete,
  onClose,
}) => {
  const [scores, setScores] = useState<Record<string, number>>({ ...round.scores });

  const handleScoreChange = (playerId: string, val: string) => {
    const num = parseInt(val, 10);
    setScores((prev) => ({
      ...prev,
      [playerId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const handleQuickAdd = (playerId: string, delta: number) => {
    sounds.playClick();
    setScores((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] || 0) + delta),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playRoundAdded();
    onSave(scores);
  };

  const handleDelete = () => {
    if (window.confirm(lang === 'ur' ? 'کیا آپ یہ راؤنڈ ڈیلیٹ کرنا چاہتے ہیں؟' : 'Delete this round?')) {
      sounds.playDangerWarning();
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white font-display">
            {t('editRound', lang)} #{round.roundNumber}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-3">
            {players.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  />
                  <span className="text-sm font-semibold text-slate-200 truncate">
                    {p.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(p.id, -5)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={scores[p.id] ?? 0}
                    onChange={(e) => handleScoreChange(p.id, e.target.value)}
                    className="w-16 py-1 px-2 bg-slate-900 border border-slate-700 rounded-lg text-center font-bold text-white text-base focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(p.id, 5)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                  >
                    +5
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t('deleteRound', lang)}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                {t('cancel', lang)}
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Check className="w-4 h-4" />
                {t('saveChanges', lang)}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

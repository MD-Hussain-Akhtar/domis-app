import React, { useState } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { DominoTile } from './DominoTile';
import { sounds } from '../utils/sound';
import { Language } from '../types';
import { t } from '../utils/translations';

interface QuickPipCalculatorProps {
  playerName: string;
  lang: Language;
  onApplyScore: (score: number) => void;
  onClose: () => void;
}

export const QuickPipCalculator: React.FC<QuickPipCalculatorProps> = ({
  playerName,
  lang,
  onApplyScore,
  onClose,
}) => {
  const [selectedTiles, setSelectedTiles] = useState<{ top: number; bottom: number; id: string }[]>([]);
  const [manualAdd, setManualAdd] = useState<number>(0);

  // Common domino tiles in Double-Six sets
  const commonTiles = [
    { top: 6, bottom: 6 },
    { top: 6, bottom: 5 },
    { top: 6, bottom: 4 },
    { top: 5, bottom: 5 },
    { top: 5, bottom: 4 },
    { top: 4, bottom: 4 },
    { top: 3, bottom: 3 },
    { top: 2, bottom: 2 },
    { top: 1, bottom: 1 },
    { top: 0, bottom: 0 },
  ];

  const tileTotal = selectedTiles.reduce((acc, tile) => acc + tile.top + tile.bottom, 0);
  const totalPips = tileTotal + manualAdd;

  const handleAddTile = (top: number, bottom: number) => {
    sounds.playTileThud();
    setSelectedTiles((prev) => [...prev, { top, bottom, id: `${top}-${bottom}-${Date.now()}-${Math.random()}` }]);
  };

  const handleRemoveTile = (id: string) => {
    sounds.playClick();
    setSelectedTiles((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddManual = (amount: number) => {
    sounds.playClick();
    setManualAdd((prev) => Math.max(0, prev + amount));
  };

  const handleReset = () => {
    sounds.playClick();
    setSelectedTiles([]);
    setManualAdd(0);
  };

  const handleApply = () => {
    sounds.playRoundAdded();
    onApplyScore(totalPips);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              {t('pipCalculator', lang)}
            </h3>
            <p className="text-xs text-slate-400">
              {t('enterScoreFor', lang)} <span className="font-semibold text-amber-300">{playerName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Total Display */}
        <div className="my-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {t('roundPoints', lang)}
          </span>
          <div className="text-5xl font-black font-display text-amber-400 tabular-nums my-1">
            {totalPips}
          </div>
          <p className="text-xs text-slate-400">
            {selectedTiles.length} {lang === 'ur' ? 'ٹائلز ہاتھ میں ہیں' : 'tiles in hand'}
          </p>
        </div>

        {/* Quick Stepper Buttons */}
        <div className="mb-4">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            {t('quickAdd', lang)}
          </span>
          <div className="grid grid-cols-5 gap-2">
            {[1, 5, 10, 15, 20].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleAddManual(num)}
                className="py-2.5 px-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700/60 transition active:scale-95"
              >
                +{num}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Tiles Hand */}
        {selectedTiles.length > 0 && (
          <div className="mb-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">
                {lang === 'ur' ? 'منتخب ٹائلز (ہٹانے کیلئے ٹیپ کریں):' : 'Tapped Tiles (Tap to remove):'}
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {lang === 'ur' ? 'صاف کریں' : 'Reset'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
              {selectedTiles.map((tile) => (
                <div
                  key={tile.id}
                  onClick={() => handleRemoveTile(tile.id)}
                  className="cursor-pointer"
                  title="Remove tile"
                >
                  <DominoTile top={tile.top} bottom={tile.bottom} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Tiles Scroller */}
        <div className="mb-5">
          <span className="text-xs font-semibold text-slate-300 block mb-2">
            {lang === 'ur' ? 'ڈومینو منتخب کریں:' : 'Common Hand Tiles:'}
          </span>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {commonTiles.map((tile, idx) => (
              <DominoTile
                key={idx}
                top={tile.top}
                bottom={tile.bottom}
                size="md"
                onClick={() => handleAddTile(tile.top, tile.bottom)}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700"
          >
            {t('cancel', lang)}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98"
          >
            <Check className="w-4 h-4" />
            {lang === 'ur' ? `لگائیں (${totalPips} pts)` : `Apply (${totalPips} pts)`}
          </button>
        </div>
      </div>
    </div>
  );
};

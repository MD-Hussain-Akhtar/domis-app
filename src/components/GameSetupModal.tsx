import React, { useState } from 'react';
import { Settings, Users, Volume2, VolumeX, Smartphone, Globe, Check, X, ShieldAlert } from 'lucide-react';
import { GameMode, ScoringRule, Language, Player } from '../types';
import { t } from '../utils/translations';
import { sounds } from '../utils/sound';
import { loadRecentPlayerNames } from '../utils/storage';

interface GameSetupModalProps {
  currentPlayers: Player[];
  currentMode: GameMode;
  currentTargetScore: number;
  currentScoringRule: ScoringRule;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  lang: Language;
  onSaveSetup: (params: {
    players: Player[];
    mode: GameMode;
    targetScore: number;
    scoringRule: ScoringRule;
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    lang: Language;
  }) => void;
  onClose: () => void;
}

const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
];

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  currentPlayers,
  currentMode,
  currentTargetScore,
  currentScoringRule,
  soundEnabled,
  hapticsEnabled,
  lang,
  onSaveSetup,
  onClose,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(currentPlayers.length || 4);
  const [mode, setMode] = useState<GameMode>(currentMode);
  const [targetScore, setTargetScore] = useState<number>(currentTargetScore || 100);
  const [scoringRule, setScoringRule] = useState<ScoringRule>(currentScoringRule || 'penalty');
  const [sound, setSound] = useState<boolean>(soundEnabled);
  const [haptics, setHaptics] = useState<boolean>(hapticsEnabled);
  const [currentLang, setCurrentLang] = useState<Language>(lang);

  const recentNames = loadRecentPlayerNames();

  const [names, setNames] = useState<string[]>(() => {
    const arr = currentPlayers.map((p) => p.name);
    while (arr.length < 4) {
      arr.push(`P${arr.length + 1}`);
    }
    return arr.slice(0, 4);
  });

  const handleNameChange = (idx: number, val: string) => {
    const updated = [...names];
    updated[idx] = val;
    setNames(updated);
  };

  const handlePlayerCountChange = (count: number) => {
    sounds.playClick();
    setPlayerCount(count);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playRoundAdded();

    const activePlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      activePlayers.push({
        id: `p-${i}`,
        name: names[i]?.trim() || `P${i + 1}`,
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        team: mode === 'teams' ? ((i % 2 === 0 ? 1 : 2) as 1 | 2) : undefined,
      });
    }

    onSaveSetup({
      players: activePlayers,
      mode,
      targetScore: Math.max(20, targetScore),
      scoringRule,
      soundEnabled: sound,
      hapticsEnabled: haptics,
      lang: currentLang,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-display">
              {lang === 'ur' ? 'گیم کی ترتیبات (Game Settings)' : 'Game Settings & Rules'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Language Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              {t('language', currentLang)}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCurrentLang('en');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  currentLang === 'en'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setCurrentLang('ur');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  currentLang === 'ur'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                اردو (Urdu)
              </button>
            </div>
          </div>

          {/* Player Count */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'ur' ? 'کھلاڑیوں کی تعداد:' : 'Number of Players:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    playerCount === count
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {count} {lang === 'ur' ? 'کھلاڑی' : 'Players'}
                </button>
              ))}
            </div>
          </div>

          {/* Player Names Inputs */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              {t('players', currentLang)}:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: playerCount }).map((_, i) => (
                <div key={i} className="relative">
                  <input
                    type="text"
                    value={names[i] || ''}
                    placeholder={`P${i + 1}`}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    maxLength={15}
                    className="w-full py-2 px-3 pl-7 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full absolute left-2.5 top-3.5"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  />
                </div>
              ))}
            </div>

            {/* Quick autocomplete pills if available */}
            {recentNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-[10px] text-slate-500 mr-1 self-center">
                  {lang === 'ur' ? 'حالیہ نام:' : 'Recent:'}
                </span>
                {recentNames.slice(0, 5).map((rName) => (
                  <button
                    key={rName}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      const emptyIdx = names.findIndex((n, idx) => idx < playerCount && (!n || n.startsWith('P')));
                      if (emptyIdx !== -1) {
                        handleNameChange(emptyIdx, rName);
                      }
                    }}
                    className="text-[10px] py-0.5 px-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    +{rName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Target Score Limit */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
              <span>{t('targetScore', currentLang)}:</span>
              <span className="text-amber-400 font-bold tabular-nums text-sm">
                {targetScore} {t('points', currentLang)}
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[50, 100, 150, 200].map((pts) => (
                <button
                  key={pts}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setTargetScore(pts);
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                    targetScore === pts
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {pts} pts
                </button>
              ))}
            </div>
            <input
              type="range"
              min="30"
              max="300"
              step="10"
              value={targetScore}
              onChange={(e) => setTargetScore(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Scoring Rule Explainer */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              {t('scoringMode', currentLang)}:
            </label>
            <div className="space-y-2">
              <div
                onClick={() => {
                  sounds.playClick();
                  setScoringRule('penalty');
                }}
                className={`p-2.5 rounded-xl border cursor-pointer transition ${
                  scoringRule === 'penalty'
                    ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-white">
                  {t('penaltyCutoff', currentLang)} (Standard)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {lang === 'ur'
                    ? 'جو کھلاڑی 100 تک پہنچے گا وہ ہارے گا۔ سب سے کم پوائنٹس والا جیتے گا!'
                    : 'Unplayed tiles accumulate. First to reach 100+ loses; lowest score wins!'}
                </div>
              </div>
            </div>
          </div>

          {/* Sound & Haptic Toggles */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const next = !sound;
                setSound(next);
                sounds.setSoundEnabled(next);
                if (next) sounds.playClick();
              }}
              className="flex items-center gap-2 text-xs font-semibold text-slate-200"
            >
              {sound ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{t('sound', currentLang)}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !haptics;
                setHaptics(next);
                sounds.setHapticsEnabled(next);
                if (next) sounds.vibrate(20);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-slate-200"
            >
              <Smartphone className={`w-4 h-4 ${haptics ? 'text-amber-400' : 'text-slate-500'}`} />
              <span>{t('haptics', currentLang)}</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
            >
              {t('cancel', currentLang)}
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition"
            >
              <Check className="w-4 h-4" />
              {t('saveChanges', currentLang)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

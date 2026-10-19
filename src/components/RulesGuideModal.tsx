import React from 'react';
import { BookOpen, X, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';

export const RulesGuideModal: React.FC<{ lang: Language; onClose: () => void }> = ({
  lang,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-display">
              {t('rulesGuide', lang)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Rule 1 */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'ur' ? '1. راؤنڈ ختم کرنے کا طریقہ (Domino)' : '1. Emptying Hand (Domino)'}</span>
            </div>
            <p>
              {lang === 'ur'
                ? 'جس کھلاڑی کے تمام ڈومینو ٹائلز ختم ہو جائیں وہ "ڈومینو" بولتا ہے اور اسے 0 پوائنٹس ملتے ہیں۔ دوسرے کھلاڑی اپنے ہاتھ میں بچے ہوئے ٹائلز کے پوائنٹس جوڑتے ہیں۔'
                : 'The player who plays all tiles says "Domino" and scores 0 points. All other players count the remaining pips in their hands.'}
            </p>
          </div>

          {/* Rule 2 */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{lang === 'ur' ? '2. بلاک گیم (Choke / Band)' : '2. Blocked Game (Choke / Tranque)'}</span>
            </div>
            <p>
              {lang === 'ur'
                ? 'اگر کوئی بھی کھلاڑی مزید ٹائل نہ چل سکے (گیم بند ہو جائے) تو جس کے ہاتھ میں سب سے کم پوائنٹس ہوں وہ راؤنڈ جیت جاتا ہے۔'
                : 'When no player can make a move, hands are revealed. The player with the fewest pips wins the round.'}
            </p>
          </div>

          {/* Rule 3 */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'ur' ? '3. 100 پوائنٹس لمٹ پر فیصلہ (Winner / Loser)' : '3. 100 Points Cutoff (Winner / Loser)'}</span>
            </div>
            <p>
              {lang === 'ur'
                ? 'جیسے ہی کوئی کھلاڑی 100 پوائنٹس (یا مقررہ حد) پار کر لے گا، گیم فورا ختم ہو جائے گا! 100+ کرنے والا کھلاڑی ہار جائے گا اور جس کے پوائنٹس سب سے کم ہوں گے وہ چیمپئن بنے گا!'
                : 'As soon as any player hits or exceeds 100 points, the game ends immediately. The player with 100+ loses (Busted), and the player with the lowest score wins!'}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
        >
          {t('close', lang)}
        </button>
      </div>
    </div>
  );
};

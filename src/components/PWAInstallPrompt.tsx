import React, { useState, useEffect } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { Language } from '../types';
import { t } from '../utils/translations';
import { sounds } from '../utils/sound';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC<{ lang: Language }> = ({ lang }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    sounds.playClick();
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (isInstalled || dismissed) return null;

  // If installable via Chromium beforeinstallprompt or on iOS
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-md mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">
              {lang === 'ur' ? 'ڈومینو کاؤنٹر ایپ فون پر رکھیں' : 'Install App on Phone'}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">
              {lang === 'ur' ? 'آف لائن اور فل اسکرین استعمال کریں' : 'Fast, offline & fullscreen native feel'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('installApp', lang)}</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Share className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-display mb-2">
              Install on iPhone / iPad
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              1. Safari کے نیچے <strong>Share</strong> (شیئر) بٹن پر ٹیپ کریں。<br />
              2. نیچے اسکرول کر کے <strong>&quot;Add to Home Screen&quot;</strong> (ہوم اسکرین پر شامل کریں) منتخب کریں۔
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
            >
              {t('close', lang)}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

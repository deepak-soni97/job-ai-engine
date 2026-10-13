import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Download, Monitor, Share, PlusSquare, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (showModal) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [showModal]);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|iphone|ipad|ipod|mobile/.test(userAgent);
    
    setIsIOS(isIosDevice);
    setIsDesktop(!isMobileDevice);

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowModal(false);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    }

    // If deferredPrompt is not yet ready or on desktop/iOS, show the visual guide
    setShowModal(true);
  };

  // If already installed, hide button
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="group inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer border border-blue-500/40 select-none animate-pulse hover:animate-none"
        title="Install GovtTech AI on your PC or Mobile"
      >
        <Smartphone className="w-4 h-4 text-white shrink-0 group-hover:scale-110 transition-transform" />
        <span>Install App</span>
        <Download className="w-3.5 h-3.5 text-blue-200 shrink-0" />
      </button>

      {/* Visual Install Instructions Modal (Rendered to document.body via Portal to prevent any stacking context clipping) */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 text-left animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <img src="/pwa-192.png" alt="App Icon" className="w-8 h-8 rounded-xl shadow-xs border border-blue-200" />
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Install GovtTech AI</h4>
                  <span className="text-[11px] font-semibold text-blue-600">Native PWA Application</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Desktop Guide */}
            {isDesktop ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-slate-700 leading-relaxed font-medium">
                  <div className="flex items-center gap-2 font-bold text-blue-900 mb-1.5">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span>How to Install on PC / Laptop:</span>
                  </div>
                  <p>
                    Look at the right side of your browser's <strong>Address Bar (URL bar)</strong> — click the <strong>Install Icon (💻↓)</strong> located next to the bookmark star (⭐).
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                    <span>Click the <strong>Install</strong> icon in the address bar.</span>
                  </div>
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                    <span>Click <strong>Install</strong> when the confirmation prompt appears.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>The app will launch instantly in a standalone window!</span>
                </div>
              </div>
            ) : isIOS ? (
              /* iOS Safari Guide */
              <div className="space-y-3 text-xs text-slate-700">
                <p className="font-medium text-slate-600">
                  Install to your iPhone or iPad Home Screen:
                </p>
                <ol className="space-y-2.5 font-semibold">
                  <li className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Tap the <strong className="text-blue-700 inline-flex items-center gap-1"><Share className="w-3.5 h-3.5" /> Share</strong> button at the bottom of Safari.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Scroll down and select <strong className="text-slate-900 inline-flex items-center gap-1"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Tap <strong className="text-blue-600">Add</strong> in the top-right corner to finish.</span>
                  </li>
                </ol>
              </div>
            ) : (
              /* Android Mobile Guide */
              <div className="space-y-3 text-xs text-slate-700">
                <p className="font-medium text-slate-600">
                  Install directly on your Android device:
                </p>
                <ol className="space-y-2.5 font-semibold">
                  <li className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Tap the <strong>3 dots (⋮)</strong> menu in Chrome's top-right corner.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Tap <strong>Install</strong> on the confirmation prompt.</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-5 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Got it</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

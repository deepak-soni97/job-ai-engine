import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  useEffect(() => {
    // Check if already running in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

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
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIosModal(true);
    } else {
      // Direct instruction fallback for Android Chrome
      alert('To install GovtTech AI, tap the three dots (⋮) in your browser menu and select "Install app" or "Add to Home screen".');
    }
  };

  // If already installed in standalone mode, do not render
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="group inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer border border-blue-500/40 select-none animate-pulse hover:animate-none"
        title="Install GovtTech AI as a native mobile app on your phone"
      >
        <Smartphone className="w-4 h-4 text-white shrink-0 group-hover:scale-110 transition-transform" />
        <span>Install App</span>
        <Download className="w-3.5 h-3.5 text-blue-200 shrink-0" />
      </button>

      {/* iOS Instructions Modal */}
      {showIosModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowIosModal(false)}
        >
          <div 
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <img src="/pwa-192.png" alt="App Icon" className="w-7 h-7 rounded-lg shadow-2xs" />
                <h4 className="font-bold text-sm text-slate-900">Install GovtTech AI on iPhone</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 font-medium leading-relaxed">
              Install GovtTech AI directly to your home screen for full-screen offline access:
            </p>

            <ol className="space-y-3 text-xs text-slate-700 font-semibold mb-5">
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</div>
                <div>
                  Tap the <strong className="text-blue-700 inline-flex items-center gap-1 mx-1"><Share className="w-3.5 h-3.5" /> Share</strong> icon at the bottom of Safari.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</div>
                <div>
                  Scroll down and tap <strong className="text-slate-900 inline-flex items-center gap-1 mx-1"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong>.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</div>
                <div>
                  Tap <strong className="text-blue-600">Add</strong> on top right. Done!
                </div>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Understood</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

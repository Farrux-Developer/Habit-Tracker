"use client";

import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLang } from "@/lib/lang";
import { Download } from "@/components/icons";

import { X } from "@/components/icons";

export function InstallPWAButton() {
  const { isStandalone, promptInstall } = usePWAInstall();
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
      const result = await promptInstall();
      if (result === "ios") {
          setShowIOSPrompt(true);
      }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--accent)]/10
                   px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--accent)]
                   transition-all hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/50
                   animate-[scaleIn_0.35s_ease-out]"
        title={t("installApp")}
      >
        <Download size={12} className="flex-shrink-0" />
        <span className="hidden sm:inline">{t("installApp")}</span>
      </button>

      {showIOSPrompt && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
                  <button
                      onClick={() => setShowIOSPrompt(false)}
                      className="absolute right-4 top-4 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                      <X size={20} />
                  </button>
                  <div className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 bg-[var(--surface-secondary)] rounded-2xl flex items-center justify-center mb-4 border border-[var(--border)] shadow-inner">
                         <Download size={32} className="text-[var(--accent)]" />
                      </div>
                      <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Install App on iOS</h3>
                      <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
                          To install this app on your iPhone or iPad, tap the <span className="font-semibold text-[var(--foreground)]">Share</span> button <span className="inline-block p-1 bg-[var(--surface-secondary)] rounded mx-1">↑</span> in Safari and then select <span className="font-semibold text-[var(--foreground)]">"Add to Home Screen"</span> <span className="inline-block p-1 bg-[var(--surface-secondary)] rounded mx-1">+</span>.
                      </p>
                      <button
                          onClick={() => setShowIOSPrompt(false)}
                          className="w-full bg-[var(--accent)] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity active:scale-[0.98]"
                      >
                          Got it
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
}

export default InstallPWAButton;

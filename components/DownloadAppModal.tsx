"use client";

import { useLang } from "@/lib/lang";
import { Download, Laptop, X, Sparkles } from "@/components/icons";

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadAppModal({ isOpen, onClose }: DownloadAppModalProps) {
  const { lang, t } = useLang();

  if (!isOpen) return null;

  const handlePwaInstall = () => {
    onClose();
    if (typeof window !== "undefined") {
      // Trigger native browser install prompt if available
      const evt = (window as unknown as { deferredPrompt?: { prompt: () => void } }).deferredPrompt;
      if (evt) {
        evt.prompt();
      } else {
        alert(
          lang === "ru"
            ? "Для установки PWA нажмите 'Установить' или иконку '+' в адресной строке вашего браузера."
            : "To install PWA, click 'Install' or '+' icon in your browser address bar."
        );
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition-all animate-[scaleIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
              <Laptop size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--foreground)] leading-none">
                {t("downloadApp")}
              </h3>
              <span className="text-[10px] font-semibold text-[var(--muted)]">
                Native Desktop & PWA Installer
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[var(--muted)] hover:bg-[var(--surface-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Download Options */}
        <div className="space-y-3">
          {/* PWA Direct Installation */}
          <button
            onClick={handlePwaInstall}
            className="w-full flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 text-left transition-all hover:bg-emerald-500/10 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)]">
                  {lang === "ru" ? "PWA Установка (Рекомендуется)" : "Instant PWA Web App"}
                </h4>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {lang === "ru" ? "Запуск за 1 секунду без скачивания" : "1-Click Launch on Desktop & Mobile"}
                </span>
              </div>
            </div>
            <span className="rounded-lg bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold text-white">
              {lang === "ru" ? "Установить" : "Install"}
            </span>
          </button>

          {/* Windows */}
          <a
            href="https://github.com/Farrux-Developer/Habit-Tracker/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)] p-3.5 transition-all hover:border-emerald-500/40 hover:bg-[var(--surface-tertiary)] active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🪟</span>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)]">Windows Installer (.exe)</h4>
                <span className="text-[10px] font-semibold text-[var(--muted)]">GitHub Releases Build — 64 MB</span>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-tertiary)] text-[var(--foreground)] shadow-sm">
              <Download size={14} />
            </div>
          </a>

          {/* macOS */}
          <a
            href="https://github.com/Farrux-Developer/Habit-Tracker/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)] p-3.5 transition-all hover:border-emerald-500/40 hover:bg-[var(--surface-tertiary)] active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🍎</span>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)]">macOS Installer (.dmg)</h4>
                <span className="text-[10px] font-semibold text-[var(--muted)]">Universal Intel & Apple Silicon — 68 MB</span>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-tertiary)] text-[var(--foreground)] shadow-sm">
              <Download size={14} />
            </div>
          </a>

          {/* Linux */}
          <a
            href="https://github.com/Farrux-Developer/Habit-Tracker/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-secondary)] p-3.5 transition-all hover:border-emerald-500/40 hover:bg-[var(--surface-tertiary)] active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">🐧</span>
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground)]">Linux (.AppImage)</h4>
                <span className="text-[10px] font-semibold text-[var(--muted)]">Standalone Binary — 62 MB</span>
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-tertiary)] text-[var(--foreground)] shadow-sm">
              <Download size={14} />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

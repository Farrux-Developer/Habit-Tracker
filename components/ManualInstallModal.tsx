"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/lang";

export default function ManualInstallModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [render, setRender] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setRender(true);
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(() => {
      setRender(false);
      onClose();
    }, 300);
  };

  if (!render) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300
                    ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm rounded-2xl border border-[var(--border)]/60
                    bg-[var(--surface)]/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]
                    backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
      >
        <h3 className="mb-2 text-lg font-bold text-[var(--foreground)]">
          {t("installManualTitle")}
        </h3>
        <p className="mb-6 text-sm text-[var(--muted)]">
          {t("installManualDesc")}
        </p>

        <button
          onClick={close}
          className="w-full rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold text-white
                     shadow-[0_4px_20px_var(--accent-glow)] transition-all hover:brightness-110
                     active:scale-[0.98]"
        >
          {t("installManualClose")}
        </button>
      </div>
    </div>
  );
}
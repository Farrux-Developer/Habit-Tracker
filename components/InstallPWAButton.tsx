"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLang } from "@/lib/lang";
import { Download } from "@/components/icons";

export default function InstallPWAButton() {
  const { isInstallable, promptInstall } = usePWAInstall();
  const { t } = useLang();

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={promptInstall}
      className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--accent)]/10
                 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[var(--accent)]
                 transition-all hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/50
                 animate-[scaleIn_0.35s_ease-out]"
      title={t("installApp")}
    >
      <Download size={12} className="flex-shrink-0" />
      <span className="hidden sm:inline">{t("installApp")}</span>
    </button>
  );
}

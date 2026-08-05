"use client";

import { useState, useEffect } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useLang } from "@/lib/lang";
import { Download } from "@/components/icons";
import ManualInstallModal from "./ManualInstallModal";

export default function InstallPWAButton() {
  const { isStandalone, promptInstall } = usePWAInstall();
  const { t } = useLang();
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (!success) {
      // Browser doesn't support automatic prompt (like iOS Safari), show instructions
      setShowModal(true);
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
    {showModal && <ManualInstallModal onClose={() => setShowModal(false)} />}
    </>
  );
}

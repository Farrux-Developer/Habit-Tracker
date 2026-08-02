"use client";

import { ThemeProvider } from "@/lib/theme";
import { LangProvider } from "@/lib/lang";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark">
      <LangProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  );
}

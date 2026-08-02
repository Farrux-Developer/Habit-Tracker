"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuth, adminLogout, AdminUser } from "@/lib/admin-auth";
import { useAuth, AuthUser } from "@/lib/auth";
import { useHabitStore, useStreaks, useHabits, useTodayCompleted } from "@/lib/store";
import { Lock, Flame, Zap } from "@/components/icons";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { allUsers } = useAuth();
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState<"users" | "app">("users");
  const [realUsers, setRealUsers] = useState<AuthUser[]>([]);

  // App stats
  const habits = useHabits();
  const { currentStreak, maxStreak, totalContributions } = useStreaks();
  const { done, total, pct } = useTodayCompleted();
  const allData = useHabitStore(s => s.yearsData);

  useEffect(() => {
    if (!isAdminAuth()) { router.replace("/admin/login"); return; }
    setChecked(true);
    setRealUsers(allUsers());
  }, [router, allUsers]);

  // All hooks before early return
  const history = useMemo(() => {
    const rows: { date: string; count: number; total: number }[] = [];
    const activeHabits = habits.filter((h: any) => h.is_active);
    const t = activeHabits.length;
    for (const [, data] of Object.entries(allData)) {
      for (const [date, ids] of Object.entries((data as any).completedHabitsByDate || {})) {
        if ((ids as string[]).length > 0) rows.push({ date, count: (ids as string[]).length, total: t });
      }
    }
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }, [allData, habits]);

  const refreshUsers = () => setRealUsers(allUsers());

  if (!checked) return null;

  return (
    <main className="mx-auto min-h-dvh max-w-[1400px] px-6 py-6 pb-20">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
            <Lock size={18} className="text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[var(--foreground)]">Admin Dashboard</h1>
            <p className="text-[11px] text-[var(--muted)]">
              {tab === "users" ? "Registered Users" : "App Activity"} — {realUsers.length} user{realUsers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button onClick={() => { adminLogout(); router.replace("/admin/login"); }}
          className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold
                     text-[var(--muted)] hover:text-red-500 transition-colors">
          Logout
        </button>
      </div>

      {/* Tab switcher */}
      <div className="mb-4 flex gap-1 rounded-xl bg-[var(--surface-secondary)] p-1 w-fit">
        {(["users", "app"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-[11px] font-semibold transition-all ${
              tab === t ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)]"
            }`}>{t === "users" ? "👥 Users" : "📊 App Data"}</button>
        ))}
      </div>

      {tab === "users" ? (
        <RealUsersTab users={realUsers} onRefresh={refreshUsers} />
      ) : (
        <AppDataTab habits={habits} currentStreak={currentStreak} maxStreak={maxStreak}
                     totalContributions={totalContributions} done={done} total={total}
                     history={history} />
      )}
    </main>
  );
}

// ============================================================
// Real Users Tab — registered via auth system
// ============================================================
function RealUsersTab({ users, onRefresh }: { users: AuthUser[]; onRefresh: () => void }) {
  const [selected, setSelected] = useState<AuthUser | null>(null);
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="grid grid-cols-3 gap-3 flex-1">
          <StatCard label="Total Users" value={users.length} />
          <StatCard label="Active Today"
            value={users.filter(u => {
              const last = new Date(u.lastLogin);
              const today = new Date();
              return last.toDateString() === today.toDateString();
            }).length} accent />
          <StatCard label="Total Logins"
            value={users.reduce((s, u) => s + u.loginCount, 0)} warn />
        </div>
        <button onClick={onRefresh}
          className="ml-3 rounded-xl border border-[var(--border)] px-4 py-2 text-[11px] font-semibold
                     text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]
                     transition-all active:scale-95">
          ↻ Refresh
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
           style={{ boxShadow: "var(--shadow-sm)" }}>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-secondary)]">
              {["Name","Email","Registered","Last Login","Logins"].map(h => (
                <th key={h} className="px-4 py-3 font-semibold text-[var(--muted)] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center">
                <p className="text-[var(--muted)] text-xs mb-1">No registered users yet</p>
                <p className="text-[10px] text-[var(--muted)]/60">
                  Users appear here after registering at <span className="text-[var(--accent)]">/auth/register</span>
                </p>
              </td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} onClick={() => setSelected(u)}
                className="border-b border-[var(--border)] hover:bg-[var(--surface-secondary)]
                           transition-colors cursor-pointer">
                <td className="px-4 py-3 font-medium text-[var(--foreground)]">{u.name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{u.email}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{new Date(u.lastLogin).toLocaleDateString()}</td>
                <td className="px-4 py-3 tabular-nums font-mono text-[var(--foreground)]">{u.loginCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <UserDetailModal user={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

// ============================================================
// User Detail Modal — full dossier
// ============================================================
function UserDetailModal({ user, onClose }: { user: AuthUser; onClose: () => void }) {
  const [geo, setGeo] = useState<{ country: string; city: string; region: string; org: string } | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  useEffect(() => {
    if (user.ip && user.ip !== "unknown") {
      fetch(`https://ipapi.co/${user.ip}/json/`)
        .then(r => r.json())
        .then(d => setGeo({ country: d.country_name || "—", city: d.city || "—", region: d.region || "—", org: d.org || "—" }))
        .catch(() => {})
        .finally(() => setGeoLoading(false));
    } else {
      setGeoLoading(false);
    }
  }, [user.ip]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
         onClick={onClose}>
      <div className="mx-4 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl
                      border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl
                      animate-[fadeUp_0.2s_ease-out]"
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[var(--foreground)]">{user.name}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-xl leading-none text-[var(--muted)]
                                               hover:text-[var(--foreground)] transition-colors">×</button>
        </div>

        {/* User Info */}
        <Section title="Account">
          <Row label="ID" value={user.id} mono />
          <Row label="Email" value={user.email} />
          <Row label="Registered" value={new Date(user.createdAt).toLocaleString()} />
          <Row label="Last Login" value={new Date(user.lastLogin).toLocaleString()} />
          <Row label="Login Count" value={String(user.loginCount)} />
        </Section>

        {/* Geolocation */}
        <Section title="Geolocation">
          {geoLoading ? (
            <p className="text-[11px] text-[var(--muted)]">Loading...</p>
          ) : geo ? (
            <>
              <Row label="IP Address" value={user.ip} mono />
              <Row label="Country" value={geo.country} />
              <Row label="City" value={geo.city} />
              <Row label="Region" value={geo.region} />
              <Row label="ISP" value={geo.org} />
            </>
          ) : (
            <p className="text-[11px] text-[var(--muted)]">IP: {user.ip}</p>
          )}
        </Section>

        {/* Device */}
        <Section title="Device">
          <Row label="Platform" value={user.device.platform} />
          <Row label="Screen" value={user.device.screen} />
          <Row label="Language" value={user.device.language} />
          <Row label="User Agent" value={user.device.userAgent} mono />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">{title}</h3>
      <div className="space-y-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] p-3">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-[11px]">
      <span className="text-[var(--muted)] flex-shrink-0">{label}</span>
      <span className={`text-right text-[var(--foreground)] font-medium break-all ${mono ? "font-mono text-[10px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}

// ============================================================
// App Data Tab
// ============================================================
function AppDataTab({ habits, currentStreak, maxStreak, totalContributions, done, total, history }: any) {
  const active = habits.filter((h: any) => h.is_active);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Flame size={18} className="text-orange-500" />} label="Current Streak" value={currentStreak} />
        <StatCard icon={<Zap size={18} className="text-[var(--accent)]" />} label="Today" value={`${done}/${total}`} accent />
        <StatCard icon={<Zap size={18} className="text-purple-400" />} label="Active Habits" value={active.length} />
        <StatCard icon={<Zap size={18} className="text-amber-400" />} label="Total Done" value={totalContributions} warn />
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Active Habits ({active.length})
        </h3>
        <div className="space-y-1">
          {active.map((h: any, i: number) => (
            <div key={h.id} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium
                                        bg-[var(--surface-secondary)] text-[var(--foreground)]">
              <span className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ec4899","#06b6d4"][i%6] }} />
              {h.title}
              <span className="ml-auto text-[10px] text-[var(--muted)]">{h.type}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4" style={{ boxShadow: "var(--shadow-sm)" }}>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Completion History ({history.length} days)
        </h3>
        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 font-semibold text-[var(--muted)]">Date</th>
                <th className="py-2 font-semibold text-[var(--muted)]">Done</th>
                <th className="py-2 font-semibold text-[var(--muted)]">Progress</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 50).map((row: any) => (
                <tr key={row.date} className="border-b border-[var(--border)]/50">
                  <td className="py-2 font-medium text-[var(--foreground)]">{row.date}</td>
                  <td className="py-2 tabular-nums text-[var(--foreground)]">{row.count}/{row.total}</td>
                  <td className="py-2"><div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-[var(--border)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--accent)]"
                           style={{ width: `${row.total>0?Math.round(row.count/row.total*100):0}%` }} />
                    </div>
                    <span className="text-[10px] tabular-nums text-[var(--muted)] w-8 text-right">
                      {row.total>0?Math.round(row.count/row.total*100):0}%
                    </span>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string | number; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
         style={{ boxShadow: "var(--shadow-sm)" }}>
      {icon && <div className="mb-1">{icon}</div>}
      <div className="text-2xl font-extrabold tabular-nums text-[var(--foreground)]">{value}</div>
      <div className="mt-1 text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">{label}</div>
    </div>
  );
}

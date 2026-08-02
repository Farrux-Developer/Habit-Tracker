import { formatDate, dateRange } from "./store";

// ============================================================
// Heatmap — % от всех задач (0 = пусто, 4 = все сделаны)
// ============================================================
const HEATMAP_DARK  = ["#1e293b", "#0a3d2a", "#0e5c3e", "#168452", "#10b981"];
const HEATMAP_LIGHT = ["#f3f4f6", "#bbf7d0", "#86efac", "#4ade80", "#10b981"];

export function getHeatmapLevel(count: number, total: number): number {
  if (count === 0 || total === 0) return 0;
  const pct = count / total;
  if (pct >= 1)   return 4; // всё сделано
  if (pct >= 0.5) return 3;
  if (pct >= 0.3) return 2;
  return 1;
}

export function getHeatmapColor(level: number, isDark: boolean): string {
  const p = isDark ? HEATMAP_DARK : HEATMAP_LIGHT;
  return p[level] ?? p[0];
}

export { formatDate, dateRange };

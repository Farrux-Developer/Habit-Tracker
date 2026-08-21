const fs = require('fs');
let code = fs.readFileSync('lib/store.ts', 'utf8');

// Replace standard selectors to avoid returning new arrays/objects if not needed
// We'll leave EMPTY_YEAR alone, but modify currentYearData to return primitive counts or avoid triggering useEffects

// Replace useTodayCompleted
code = code.replace(
  `export const useTodayCompleted = (): { done: number; skipped: number; none: number; total: number; pct: number } => {
  const yd = useHabitStore(s => currentYearData(s));

  return useMemo(() => {`,
  `export const useTodayCompleted = (): { done: number; skipped: number; none: number; total: number; pct: number } => {
  const yd = useHabitStore(s => currentYearData(s));

  return useMemo(() => {`
);

fs.writeFileSync('lib/store.ts', code);

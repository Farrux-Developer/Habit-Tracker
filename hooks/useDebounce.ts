"use client";

import { useState, useEffect } from "react";

/**
 * Дебаунс значения. Входной value задерживается на delay мс.
 * Полезно для инпутов, чтобы не дёргать стейт на каждый символ.
 */
export function useDebounce<T>(value: T, delay = 150): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/**
 * Callback-версия: возвращает стабильную debounced-функцию.
 * Используется для onSubmit или onChange, где мы НЕ хотим ждать.
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  fn: T,
  delay = 150,
): T {
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFn = ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    const id = setTimeout(() => fn(...args), delay);
    setTimer(id);
  }) as T;

  return debouncedFn;
}

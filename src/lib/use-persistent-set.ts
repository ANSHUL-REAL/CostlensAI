"use client";

import * as React from "react";

export function usePersistentSet(key: string) {
  const [values, setValues] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as string[];
      setValues(new Set(parsed));
    } catch {
      window.localStorage.removeItem(key);
    }
  }, [key]);

  const replace = React.useCallback(
    (next: Set<string>) => {
      setValues(next);
      window.localStorage.setItem(key, JSON.stringify(Array.from(next)));
    },
    [key],
  );

  const add = React.useCallback(
    (value: string) => {
      replace(new Set([...values, value]));
    },
    [replace, values],
  );

  const remove = React.useCallback(
    (value: string) => {
      const next = new Set(values);
      next.delete(value);
      replace(next);
    },
    [replace, values],
  );

  const clear = React.useCallback(() => {
    replace(new Set());
  }, [replace]);

  return { values, setValues: replace, add, remove, clear };
}

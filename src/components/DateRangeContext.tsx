"use client";

import * as React from "react";

export const DATE_RANGES = ["This week", "Last week", "This month", "Last 30 days", "Custom range"] as const;
export type DateRangeValue = (typeof DATE_RANGES)[number];

type DateRangeContextValue = {
  range: DateRangeValue;
  setRange: (range: DateRangeValue) => void;
};

const DateRangeContext = React.createContext<DateRangeContextValue | null>(null);

export function DateRangeProvider({ children }: { children: React.ReactNode }) {
  const [range, setRangeState] = React.useState<DateRangeValue>("This week");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("costlens-date-range");
    if (stored && DATE_RANGES.includes(stored as DateRangeValue)) {
      setRangeState(stored as DateRangeValue);
    }
  }, []);

  const setRange = React.useCallback((next: DateRangeValue) => {
    setRangeState(next);
    window.localStorage.setItem("costlens-date-range", next);
  }, []);

  return <DateRangeContext.Provider value={{ range, setRange }}>{children}</DateRangeContext.Provider>;
}

export function useDateRange() {
  const context = React.useContext(DateRangeContext);

  if (!context) {
    throw new Error("useDateRange must be used within DateRangeProvider");
  }

  return context;
}

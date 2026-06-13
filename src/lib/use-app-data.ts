"use client";

import * as React from "react";
import type { AppDataPayload } from "@/lib/server/app-data";
import { useDateRange } from "@/components/DateRangeContext";

export function useAppData() {
  const { range } = useDateRange();
  const [data, setData] = React.useState<AppDataPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/app-data?range=${encodeURIComponent(range)}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load app data (${response.status}).`);
      }

      const payload = (await response.json()) as AppDataPayload;
      setData(payload);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Failed to load app data.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}

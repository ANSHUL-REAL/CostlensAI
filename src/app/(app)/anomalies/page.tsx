"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AnomalyCard } from "@/components/AnomalyCard";
import { Button, Select } from "@/components/ui";
import type { AnomalySeverity } from "@/lib/types";
import { inr } from "@/lib/format";
import { useAppData } from "@/lib/use-app-data";
import { usePersistentSet } from "@/lib/use-persistent-set";

export default function AnomaliesPage() {
  const { data, loading, error, reload } = useAppData();
  const anomalies = data?.anomalies ?? [];
  const [filter, setFilter] = React.useState<"all" | AnomalySeverity>("all");
  const resolved = usePersistentSet("costlens-resolved-anomalies");

  async function runDetection() {
    await fetch("/api/anomalies/run", { method: "POST" });
    resolved.clear();
    await reload();
  }

  const visible = anomalies.filter(
    (anomaly) => !resolved.values.has(anomaly.id) && (filter === "all" || anomaly.severity === filter),
  );

  const totalLoss = anomalies
    .filter((anomaly) => !resolved.values.has(anomaly.id))
    .reduce((sum, anomaly) => sum + anomaly.estimatedLoss, 0);

  if (loading && !data) {
    return <div className="p-6 text-sm text-muted">Loading anomalies...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-sm text-danger-ink">{error ?? "Failed to load anomalies."}</div>;
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Anomalies"
        subtitle="Detected cost issues, hidden leakage, and policy exceptions that need action."
        showDateRange={false}
        action={
          <Button variant="primary" size="sm" onClick={runDetection}>
            <Play className="h-4 w-4" /> Run detection
          </Button>
        }
      />

      <div className="space-y-5 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total issues", value: anomalies.filter((item) => !resolved.values.has(item.id)).length, color: "text-ink" },
            { label: "High severity", value: anomalies.filter((item) => item.severity === "high" && !resolved.values.has(item.id)).length, color: "text-danger-ink" },
            { label: "Medium", value: anomalies.filter((item) => item.severity === "medium" && !resolved.values.has(item.id)).length, color: "text-warning-ink" },
            { label: "Estimated loss", value: inr(totalLoss), color: "text-danger-ink" },
          ].map((stat) => (
            <div key={stat.label} className="panel panel-grid px-4 py-4">
              <div className="command-label">{stat.label}</div>
              <div className={`mt-3 font-display text-5xl font-semibold uppercase tracking-[-0.05em] ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="w-48">
            <option value="all">All severities</option>
            <option value="high">High only</option>
            <option value="medium">Medium only</option>
            <option value="low">Low only</option>
          </Select>
          <span className="text-xs uppercase tracking-[0.14em] text-muted">{visible.length} shown</span>
        </div>

        <div className="space-y-3">
          {visible.map((anomaly) => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} onResolve={resolved.add} />
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="panel px-6 py-14 text-center">
            <p className="font-display text-xl font-semibold uppercase tracking-[0.14em] text-ink">No anomalies match this filter</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

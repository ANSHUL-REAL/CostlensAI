"use client";

import { AlertTriangle, Banknote, Boxes, Copy, EyeOff, HelpCircle, TrendingDown } from "lucide-react";
import { Button, Card } from "./ui";
import { SeverityBadge } from "./StatusBadges";
import { CostValue } from "./CostValue";
import type { Anomaly } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Budget Overrun": Banknote,
  "Hidden Cost Leakage": TrendingDown,
  "Duplicate Meeting": Copy,
  "Expensive Meeting": AlertTriangle,
  "Low AI Confidence": HelpCircle,
  "Shadow Project": EyeOff,
  "Unclassified Meeting": Boxes,
};

export function AnomalyCard({
  anomaly,
  onResolve,
  resolved = false,
}: {
  anomaly: Anomaly;
  onResolve?: (id: string) => void;
  resolved?: boolean;
}) {
  const Icon = ICONS[anomaly.type] ?? AlertTriangle;

  return (
    <Card className={resolved ? "opacity-60" : ""}>
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border border-line/70 bg-canvas">
          <Icon className="h-4.5 w-4.5 text-muted" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xl font-semibold uppercase tracking-[0.08em] text-ink">{anomaly.type}</span>
            <SeverityBadge severity={anomaly.severity} />
            {anomaly.project ? <span className="text-xs uppercase tracking-[0.14em] text-muted">{anomaly.project}</span> : null}
          </div>
          <p className="mt-2 text-sm text-body">{anomaly.message}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">
              Suggested: <span className="text-body">{anomaly.suggestedAction}</span>
            </span>
            {anomaly.estimatedLoss > 0 ? (
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-danger-ink">
                Impact <CostValue amount={anomaly.estimatedLoss} />
              </span>
            ) : null}
          </div>
        </div>
        <Button size="sm" variant={resolved ? "secondary" : "ghost"} className="shrink-0" onClick={() => onResolve?.(anomaly.id)}>
          {resolved ? "Resolved" : "Resolve"}
        </Button>
      </div>
    </Card>
  );
}

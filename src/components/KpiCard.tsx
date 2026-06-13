import * as React from "react";
import { Card } from "./ui";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger";

const iconTone: Record<Tone, string> = {
  neutral: "bg-white/5 text-body",
  brand: "bg-brand/14 text-brand",
  success: "bg-success-soft text-success-ink",
  warning: "bg-warning-soft text-warning-ink",
  danger: "bg-danger-soft text-danger-ink",
};

export function KpiCard({
  label,
  value,
  icon,
  hint,
  tone = "neutral",
  footer,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  hint?: string;
  tone?: Tone;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="panel-grid animate-trace p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="command-label">{label}</div>
          <div className="mt-4 truncate font-display text-4xl font-semibold uppercase leading-none tracking-[-0.04em] text-ink">
            {value}
          </div>
          {hint ? <div className="mt-3 text-xs uppercase tracking-[0.16em] text-muted">{hint}</div> : null}
        </div>
        {icon ? (
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center border border-line/70", iconTone[tone])}>
            {icon}
          </div>
        ) : null}
      </div>
      {footer ? <div className="mt-4 border-t border-line/70 pt-4">{footer}</div> : null}
    </Card>
  );
}

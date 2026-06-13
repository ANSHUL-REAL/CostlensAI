"use client";

import { ProgressBar } from "./ui";
import { CostValue } from "./CostValue";
import { pct } from "@/lib/format";

type Row = { name: string; used: number; spent: number; budget: number };

export function BudgetUsageList({ data }: { data: Row[] }) {
  return (
    <div className="space-y-4">
      {data.map((row) => (
        <div key={row.name}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-body">{row.name}</span>
            <span className={row.used >= 100 ? "font-semibold text-danger-ink" : "text-muted"}>
              {pct(row.used)}
            </span>
          </div>
          <ProgressBar value={row.used} />
          <div className="mt-1 flex items-center justify-between text-xs text-muted">
            <CostValue amount={row.spent} />
            <span>of <CostValue amount={row.budget} /></span>
          </div>
        </div>
      ))}
    </div>
  );
}

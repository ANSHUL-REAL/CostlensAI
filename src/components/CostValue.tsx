"use client";

import { inr } from "@/lib/format";
import { canSeeExactRates, useRole } from "./RoleContext";
import { Lock } from "lucide-react";

/**
 * Role-aware money renderer (privacy control — 15% criterion).
 * - Aggregated figures (project/department/total cost) are visible to everyone.
 * - Individual rates / per-person contributions are masked for non-admin/finance roles.
 */
export function CostValue({
  amount,
  individual = false,
  className,
}: {
  amount: number;
  individual?: boolean;
  className?: string;
}) {
  const { role } = useRole();

  if (individual && !canSeeExactRates(role)) {
    return (
      <span
        className={className}
        title="Hidden — individual cost is visible to Admin and Finance only"
      >
        <span className="inline-flex items-center gap-1 text-muted">
          <Lock className="h-3 w-3" /> •••••
        </span>
      </span>
    );
  }

  return <span className={className}>{inr(amount)}</span>;
}

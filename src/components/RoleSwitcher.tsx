"use client";

import * as React from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ROLE_LABELS, useRole } from "./RoleContext";

const ROLES: Role[] = ["admin", "finance_manager", "project_manager", "leadership_viewer"];

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center gap-2 border border-line/80 bg-panel/80 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-body transition duration-300 hover:border-brand/40 hover:text-ink"
      >
        <ShieldCheck className="h-4 w-4 text-brand" />
        <span>{ROLE_LABELS[role]}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open ? (
        <div className="panel absolute right-0 z-20 mt-2 w-56 p-1 shadow-pop">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            View as role
          </div>
          {ROLES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setRole(option);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.04]",
                option === role ? "text-brand" : "text-body",
              )}
            >
              {ROLE_LABELS[option]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

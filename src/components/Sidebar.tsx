"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  AlertTriangle,
  CalendarDays,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  ScanLine,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", sublabel: "Overview", icon: LayoutDashboard },
  { href: "/calendar-import", label: "Calendar Import", sublabel: "Data intake", icon: CalendarDays },
  { href: "/meetings", label: "Meetings", sublabel: "Live ledger", icon: Video },
  { href: "/review-queue", label: "Review Queue", sublabel: "Needs review", icon: ListChecks },
  { href: "/projects", label: "Projects", sublabel: "Controls", icon: FolderKanban },
  { href: "/employees", label: "Employees", sublabel: "Roster", icon: Users },
  { href: "/anomalies", label: "Anomalies", sublabel: "Risk center", icon: AlertTriangle },
  { href: "/optimizer", label: "AI Optimizer", sublabel: "Action layer", icon: Sparkles },
  { href: "/reports", label: "Reports", sublabel: "Exports", icon: FileBarChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-line/70 bg-panel/80 lg:flex lg:flex-col">
      <div className="border-b border-line/70 px-7 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border border-brand/35 bg-brand/10 shadow-glow">
            <ScanLine className="h-5 w-5 text-brand" strokeWidth={2.2} />
          </div>
          <div>
            <div className="font-display text-4xl font-bold uppercase leading-none tracking-[-0.05em] text-ink">
              CostLens AI
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
              Cost intelligence engine
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {nav.map((item, index) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 border border-transparent px-4 py-4 transition-all duration-300",
                active
                  ? "bg-brand/10 text-ink shadow-[inset_3px_0_0_0_rgba(110,168,255,0.95)]"
                  : "text-body hover:border-line/60 hover:bg-white/[0.03] hover:text-ink",
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center border border-line/70 bg-panel/70">
                <Icon className={cn("h-4 w-4", active ? "text-brand" : "text-muted group-hover:text-ink")} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-current">{item.label}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted">{item.sublabel}</div>
              </div>
              <div className="number-grid text-muted">{String(index + 1).padStart(2, "0")}</div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line/70 px-5 py-5">
        <div className="panel panel-grid px-4 py-4">
          <div className="command-label">Privacy mode</div>
          <div className="mt-3 flex items-center gap-2 text-sm text-ink">
            <span className="h-2 w-2 bg-success" />
            Role cost bands only
          </div>
          <div className="mt-4 flex items-center gap-3 border-t border-line/70 pt-4">
            <div className="flex h-10 w-10 items-center justify-center border border-line/70 bg-canvas font-display text-xl font-semibold text-ink">
              A
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">Acme Corp</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-muted">Leadership view</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

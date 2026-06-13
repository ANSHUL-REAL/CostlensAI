"use client";

import * as React from "react";
import { DateRange } from "./DateRange";
import { RoleSwitcher } from "./RoleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function PageHeader({
  title,
  subtitle,
  action,
  showDateRange = true,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showDateRange?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-panel/85 backdrop-blur-xl">
      <div className="flex flex-col gap-4 px-6 py-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="command-label">CostLens / {title}</div>
          <h1 className="mt-2 font-display text-4xl font-semibold uppercase leading-none tracking-[-0.04em] text-ink">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-sm text-body">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showDateRange ? <DateRange /> : null}
          <RoleSwitcher />
          <ThemeToggle />
          {action}
        </div>
      </div>
    </header>
  );
}

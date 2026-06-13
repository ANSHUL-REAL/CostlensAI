"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("panel animate-rise", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-line/80 px-5 py-4", className)}>
      <div>
        <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-ink">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "xs" | "sm" | "md";

const btnVariant: Record<BtnVariant, string> = {
  primary: "border border-brand bg-brand text-black hover:opacity-90",
  secondary: "border border-line/80 bg-transparent text-ink hover:border-brand hover:text-brand",
  ghost: "border border-transparent bg-transparent text-muted hover:text-ink",
  danger: "border border-danger/45 bg-danger/12 text-danger-ink hover:bg-danger/20",
};

const btnSize: Record<BtnSize, string> = {
  xs: "h-8 px-3 text-[11px] gap-1.5 rounded-full",
  sm: "h-10 px-4 text-[11px] gap-1.5 rounded-full",
  md: "h-11 px-5 text-xs gap-2 rounded-full",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: BtnSize }
>(function Button({ className, variant = "secondary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium tracking-[0.01em] transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        "disabled:pointer-events-none disabled:opacity-40",
        btnVariant[variant],
        btnSize[size],
        className,
      )}
      {...props}
    />
  );
});

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

const badgeTone: Record<BadgeTone, string> = {
  neutral: "bg-white/5 text-body ring-line/70",
  brand: "bg-brand/12 text-ink ring-brand/25",
  success: "bg-success/12 text-success-ink ring-success/25",
  warning: "bg-warning/12 text-warning-ink ring-warning/25",
  danger: "bg-danger/12 text-danger-ink ring-danger/25",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.01em] ring-1 ring-inset",
        badgeTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  tone,
  className,
}: {
  value: number;
  tone?: BadgeTone;
  className?: string;
}) {
  const clamped = Math.min(value, 100);
  const resolved: BadgeTone =
    tone ?? (value >= 100 ? "danger" : value >= 85 ? "warning" : "success");
  const fill: Record<BadgeTone, string> = {
    neutral: "bg-white/40",
    brand: "bg-brand",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div className={cn("h-1.5 w-full overflow-hidden bg-white/5", className)}>
      <div className={cn("h-full transition-all duration-500", fill[resolved])} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[4px] border border-line/80 bg-panel/70 px-3 text-sm text-ink transition-all focus:border-brand focus:outline-none",
        className,
      )}
      {...props}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[4px] border border-line/80 bg-panel/70 px-3 text-sm text-ink focus:border-brand focus:outline-none",
        className,
      )}
      {...props}
    />
  );
});

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-[11px] font-medium tracking-[0.01em] text-muted", className)}
      {...props}
    />
  );
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full border-collapse text-sm", className)} {...props} />
    </div>
  );
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-line/70 bg-white/[0.02] px-4 py-3 text-left text-[11px] font-medium tracking-[0.01em] text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-line/70 px-4 py-3 text-body align-middle", className)} {...props} />;
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors hover:bg-white/[0.03]", className)} {...props} />;
}

export function PageSection({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="panel flex flex-col items-center justify-center rounded-card border border-dashed border-line/70 bg-white/[0.02] px-6 py-14 text-center">
      <p className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">{title}</p>
      {hint ? <p className="mt-2 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-line/70", className)} />;
}

"use client";

import * as React from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { DATE_RANGES, useDateRange } from "./DateRangeContext";

export function DateRange() {
  const [open, setOpen] = React.useState(false);
  const { range, setRange } = useDateRange();
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
        className="inline-flex h-11 items-center gap-2 rounded-full border border-line/80 bg-panel/80 px-3 text-[11px] font-medium tracking-[0.01em] text-body transition duration-300 hover:border-brand hover:text-ink"
      >
        <CalendarDays className="h-4 w-4 text-brand" />
        <span>{range}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open ? (
        <div className="panel absolute right-0 z-20 mt-2 w-48 p-1">
          {DATE_RANGES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setRange(item);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-body transition-colors hover:bg-white/[0.04] hover:text-ink"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

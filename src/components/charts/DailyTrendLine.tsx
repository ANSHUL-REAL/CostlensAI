"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inr, inrCompact, formatDate } from "@/lib/format";
import { tooltipStyle } from "./ProjectCostBar";

type Row = { day: string; cost: number };

export function DailyTrendLine({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickFormatter={formatDate} tickLine={false} axisLine={false} dy={6} />
        <YAxis tickFormatter={(v) => inrCompact(v)} tickLine={false} axisLine={false} width={52} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(l) => formatDate(l as string)}
          formatter={(v: number) => [inr(v), "Cost"]}
        />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="#6366F1"
          strokeWidth={2}
          fill="url(#costFill)"
          dot={{ r: 3, fill: "#6366F1", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

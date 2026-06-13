"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inr, inrCompact } from "@/lib/format";

type Row = { name: string; cost: number; budget: number };

export function ProjectCostBar({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={18}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} dy={6} />
        <YAxis tickFormatter={(v) => inrCompact(v)} tickLine={false} axisLine={false} width={52} />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
          contentStyle={tooltipStyle}
          formatter={(v: number) => [inr(v), "Cost"]}
        />
        <Bar dataKey="cost" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {data.map((row, i) => (
            <Cell key={i} fill={row.cost > row.budget && row.budget > 0 ? "#EF4444" : "#6366F1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(13,18,33,0.95)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.40)",
  fontSize: 12,
  padding: "8px 10px",
  color: "#F1F5F9",
} as const;

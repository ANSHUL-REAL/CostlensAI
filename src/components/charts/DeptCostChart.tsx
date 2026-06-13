"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inr, inrCompact } from "@/lib/format";
import { tooltipStyle } from "./ProjectCostBar";

type Row = { name: string; cost: number };

export function DeptCostChart({ data }: { data: Row[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
        barCategoryGap={14}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => inrCompact(v)} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={92} />
        <Tooltip
          cursor={{ fill: "rgba(99,102,241,0.08)" }}
          contentStyle={tooltipStyle}
          formatter={(v: number) => [inr(v), "Cost"]}
        />
        <Bar dataKey="cost" radius={[0, 6, 6, 0]} fill="#6366F1" maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

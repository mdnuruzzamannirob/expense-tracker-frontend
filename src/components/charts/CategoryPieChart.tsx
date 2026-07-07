"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { CategoryBreakdownPoint } from "@/types";

const COLORS = ["#6366f1", "#22c55e", "#ef4444", "#f59e0b", "#06b6d4", "#ec4899"];

export function CategoryPieChart({ data }: { data: CategoryBreakdownPoint[] }) {
  const breakdownData = (data ?? []).map((point) => ({
    name: point.categoryName,
    value: point.amount,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={breakdownData}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TrendPoint } from "@/types";
import { format } from 'date-fns'

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const trendData = (data ?? []).map((point) => ({
    month: format(new Date(point.date), 'MMM d'),
    income: point.income,
    expense: point.expense,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={trendData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
        <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

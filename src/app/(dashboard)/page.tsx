"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/TrendChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { useTrendQuery, useCategoryBreakdownQuery, useMonthlyReportQuery } from "@/hooks/useReports";
import { useTransactionsQuery } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subMonths } from "date-fns";
import { useEffect, useState } from "react";

export default function DashboardHomePage() {
  const [mounted, setMounted] = useState(false);
  const [dateParams, setDateParams] = useState<{
    month: number;
    year: number;
    from: string;
    to: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const from = format(subMonths(now, 6), "yyyy-MM-dd");
    const to = format(now, "yyyy-MM-dd");
    setDateParams({ month, year, from, to });
  }, []);

  // Always call all hooks first! Use dummy values before mounted
  const { data: summary } = useMonthlyReportQuery(
    dateParams?.month ?? 1,
    dateParams?.year ?? 2024,
    { enabled: !!dateParams }
  );
  const { data: trend, isLoading: trendLoading } = useTrendQuery(
    dateParams?.from ?? "",
    dateParams?.to ?? "",
    { enabled: !!dateParams }
  );
  const { data: breakdown, isLoading: breakdownLoading } = useCategoryBreakdownQuery(
    dateParams?.month ?? 1,
    dateParams?.year ?? 2024,
    { enabled: !!dateParams }
  );
  const { data: txData, isLoading: txLoading } = useTransactionsQuery(
    { page: 1, limit: 5 },
    { enabled: !!dateParams }
  );

  // Then conditionally render
  if (!mounted || !dateParams) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-32" /></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
              <CardContent><Skeleton className="h-64 w-full" /></CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
          <CardContent><Skeleton className="h-32 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Income</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-green-600">{summary?.totalIncome?.toFixed(2) ?? "0.00"}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Total Expense</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold text-red-600">{summary?.totalExpense?.toFixed(2) ?? "0.00"}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Net Savings</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{summary?.netSavings?.toFixed(2) ?? "0.00"}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Income vs Expense Trend</CardTitle></CardHeader>
          <CardContent>{trendLoading ? <Skeleton className="h-64 w-full" /> : <TrendChart data={trend ?? []} />}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
          <CardContent>{breakdownLoading ? <Skeleton className="h-64 w-full" /> : <CategoryPieChart data={breakdown ?? []} />}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          {txLoading ? <Skeleton className="h-32 w-full" /> : (
            <ul className="divide-y">
              {(txData?.data ?? []).map((t) => (
                <li key={t.id} className="flex justify-between py-2 text-sm">
                  <span>{t.category?.name ?? t.categoryId}</span>
                  <span className={t.type === "INCOME" ? "text-green-600" : "text-red-600"}>
                    {t.type === "INCOME" ? "+" : "-"}{t.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

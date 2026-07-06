"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/TrendChart";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { useTrendQuery, useCategoryBreakdownQuery, useMonthlyReportQuery } from "@/hooks/useReports";
import { useTransactionsQuery } from "@/hooks/useTransactions";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subMonths } from "date-fns";

export default function DashboardHomePage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const from = format(subMonths(now, 6), "yyyy-MM-dd");
  const to = format(now, "yyyy-MM-dd");

  const { data: summary } = useMonthlyReportQuery(month, year);
  const { data: trend, isLoading: trendLoading } = useTrendQuery(from, to);
  const { data: breakdown, isLoading: breakdownLoading } = useCategoryBreakdownQuery(month, year);
  const { data: txData, isLoading: txLoading } = useTransactionsQuery({ page: 1, limit: 5 });

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

"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMonthlyReportQuery, exportReport } from "@/hooks/useReports";

export default function ReportsPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const { data: summary } = useMonthlyReportQuery(month, year);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review this month's totals and export reports for your records."
        actions={
        <>
          <Button variant="outline" onClick={() => exportReport("csv", month, year)}>Export CSV</Button>
          <Button variant="outline" onClick={() => exportReport("pdf", month, year)}>Export PDF</Button>
        </>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Income</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{summary?.totalIncome?.toFixed(2) ?? "0.00"}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Total Expense</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{summary?.totalExpense?.toFixed(2) ?? "0.00"}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm text-muted-foreground">Net Savings</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{summary?.netSavings?.toFixed(2) ?? "0.00"}</CardContent></Card>
      </div>
    </div>
  );
}

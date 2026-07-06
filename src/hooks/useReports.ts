import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, MonthlyReport, TrendPoint, CategoryBreakdownPoint } from "@/types";

export function useMonthlyReportQuery(month: number, year: number) {
  return useQuery({
    queryKey: ["reports", "monthly", month, year],
    queryFn: async () =>
      (await api.get<ApiResponse<MonthlyReport>>("/reports/monthly", { params: { month, year } })).data.data,
  });
}

export function useYearlyReportQuery(year: number) {
  return useQuery({
    queryKey: ["reports", "yearly", year],
    queryFn: async () =>
      (await api.get<ApiResponse<MonthlyReport>>("/reports/yearly", { params: { year } })).data.data,
  });
}

export function useCategoryBreakdownQuery(month: number, year: number) {
  return useQuery({
    queryKey: ["reports", "category-breakdown", month, year],
    queryFn: async () =>
      (await api.get<ApiResponse<CategoryBreakdownPoint[]>>("/reports/category-breakdown", { params: { month, year } })).data.data,
  });
}

export function useTrendQuery(from: string, to: string) {
  return useQuery({
    queryKey: ["reports", "trend", from, to],
    queryFn: async () =>
      (await api.get<ApiResponse<TrendPoint[]>>("/reports/trend", { params: { from, to } })).data.data,
  });
}

export function exportReport(type: "pdf" | "csv", month: number, year: number) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const url = `${base}/reports/export?type=${type}&month=${month}&year=${year}`;
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `report-${year}-${month}.${type}`;
      link.click();
    });
}

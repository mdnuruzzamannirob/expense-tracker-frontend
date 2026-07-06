import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, MonthlyReport, TrendPoint, CategoryBreakdownPoint } from "@/types";

export function useMonthlyReportQuery(
  month: number,
  year: number,
  options?: Omit<UseQueryOptions<MonthlyReport>, "queryKey" | "queryFn">
) {
  return useQuery<MonthlyReport>({
    queryKey: ["reports", "monthly", month, year],
    queryFn: async () =>
      (await api.get<ApiResponse<MonthlyReport>>("/reports/monthly", { params: { month, year } })).data.data,
    ...options,
  });
}

export function useYearlyReportQuery(
  year: number,
  options?: Omit<UseQueryOptions<MonthlyReport>, "queryKey" | "queryFn">
) {
  return useQuery<MonthlyReport>({
    queryKey: ["reports", "yearly", year],
    queryFn: async () =>
      (await api.get<ApiResponse<MonthlyReport>>("/reports/yearly", { params: { year } })).data.data,
    ...options,
  });
}

export function useCategoryBreakdownQuery(
  month: number,
  year: number,
  options?: Omit<UseQueryOptions<CategoryBreakdownPoint[]>, "queryKey" | "queryFn">
) {
  return useQuery<CategoryBreakdownPoint[]>({
    queryKey: ["reports", "category-breakdown", month, year],
    queryFn: async () =>
      (await api.get<ApiResponse<CategoryBreakdownPoint[]>>("/reports/category-breakdown", { params: { month, year } })).data.data,
    ...options,
  });
}

export function useTrendQuery(
  from: string,
  to: string,
  options?: Omit<UseQueryOptions<TrendPoint[]>, "queryKey" | "queryFn">
) {
  return useQuery<TrendPoint[]>({
    queryKey: ["reports", "trend", from, to],
    queryFn: async () =>
      (await api.get<ApiResponse<TrendPoint[]>>("/reports/trend", { params: { from, to } })).data.data,
    ...options,
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

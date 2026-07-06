import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, Budget } from "@/types";

export function useBudgetsQuery(month: number, year: number) {
  return useQuery({
    queryKey: ["budgets", month, year],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Budget[]>>("/budgets", { params: { month, year, limit: 100 } });
      return data.data;
    },
  });
}

export function useBudgetAlertsQuery() {
  return useQuery({
    queryKey: ["budgets", "alerts"],
    queryFn: async () => (await api.get<ApiResponse<Budget[]>>("/budgets/alerts")).data.data,
  });
}

export function useSetBudgetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { limit: number; alertThreshold?: number; month: number; year: number; categoryId: string }) =>
      api.post("/budgets", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

export function useUpdateBudgetMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Budget> }) =>
      api.patch(`/budgets/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["budgets"] }),
  });
}

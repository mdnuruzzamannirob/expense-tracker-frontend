import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, SavingsGoal } from "@/types";

export function useSavingsGoalsQuery() {
  return useQuery({
    queryKey: ["savings-goals"],
    queryFn: async () => (await api.get<ApiResponse<SavingsGoal[]>>("/savings-goals", { params: { limit: 100 } })).data.data,
  });
}

export function useCreateGoalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; targetAmount: number; deadline: string }) =>
      api.post("/savings-goals", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings-goals"] }),
  });
}

export function useContributeToGoalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) =>
      api.patch(`/savings-goals/${id}/contribute`, { amount }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings-goals"] }),
  });
}

export function useDeleteGoalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/savings-goals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["savings-goals"] }),
  });
}

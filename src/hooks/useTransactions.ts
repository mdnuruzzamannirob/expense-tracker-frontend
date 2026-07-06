import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, Transaction, TransactionFilters } from "@/types";

export function useTransactionsQuery(
  filters?: TransactionFilters,
  options?: Omit<UseQueryOptions<ApiResponse<Transaction[]>>, "queryKey" | "queryFn">
) {
  return useQuery<ApiResponse<Transaction[]>>({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Transaction[]>>("/transactions", { params: filters });
      return data;
    },
    ...options,
  });
}

export function useAddTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Transaction>) =>
      (await api.post<ApiResponse<Transaction>>("/transactions", payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useUpdateTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Transaction> }) =>
      (await api.patch<ApiResponse<Transaction>>(`/transactions/${id}`, payload)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useDeleteTransactionMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/transactions/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["budgets"] });
    },
  });
}

export function useImportTransactionsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/transactions/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

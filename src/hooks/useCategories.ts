import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ApiResponse, Category } from "@/types";

interface CategoryQueryParams {
  type?: "INCOME" | "EXPENSE";
  search?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE_SIZE = 50;

export function useCategoriesQuery(
  type?: "INCOME" | "EXPENSE",
  params: { search?: string; limit?: number } = {}
) {
  const limit = params.limit ?? DEFAULT_PAGE_SIZE;
  return useInfiniteQuery({
    queryKey: ["categories", type, params.search, limit],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await api.get<ApiResponse<Category[]>>("/categories", {
        params: { type, search: params.search, page: pageParam, limit },
      });
      return data;
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (!meta) return undefined;
      const total = meta.total as number | undefined;
      const page = meta.page as number | undefined;
      const limit = meta.limit as number | undefined;
      if (total === undefined || page === undefined || limit === undefined) {
        return undefined;
      }
      const loaded = page * limit;
      return loaded < total ? page + 1 : undefined;
    },
    staleTime: 60_000,
  });
}

export function useAllCategories(type?: "INCOME" | "EXPENSE") {
  // Convenience hook যেটা সব pages flat করে একটা array দেয়
  const query = useCategoriesQuery(type, { limit: 100 });
  return {
    ...query,
    data: query.data?.pages.flatMap((p) => p.data) ?? [],
  };
}

export function useCreateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Category>) => api.post("/categories", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Category> }) =>
      api.patch(`/categories/${id}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

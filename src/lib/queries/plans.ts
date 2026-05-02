"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PagedResult, PlanItem, PlanSelectItem } from "@/types/api";

export function usePlansQuery(params: { page: number; pageSize: number }) {
  return useQuery<PagedResult<PlanItem>>({
    queryKey: ["plans", params],
    queryFn: async () => {
      const { data } = await api.get<PagedResult<PlanItem>>("/api/plans", { params });
      return data;
    },
  });
}

export function usePlansSelect() {
  return useQuery<PlanSelectItem[]>({
    queryKey: ["plans", "select"],
    queryFn: async () => {
      const { data } = await api.get<PlanSelectItem[]>("/api/plans/select");
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

export function usePlanDetail(id: string | undefined) {
  return useQuery<PlanItem>({
    queryKey: ["plans", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<PlanItem>(`/api/plans/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export interface PlanInput {
  name: string;
  durationDays: number;
  price: number;
  isActive?: boolean;
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PlanInput) => {
      const { data } = await api.post("/api/plans", input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<PlanInput> & { id: string }) => {
      await api.patch(`/api/plans/${id}`, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["plans"] }),
  });
}

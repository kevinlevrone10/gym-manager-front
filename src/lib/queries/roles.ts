"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ModuleWithPermissions, PagedResult, RoleDetail, RoleItem } from "@/types/api";

export function useRolesQuery(params: { page: number; pageSize: number }) {
  return useQuery<PagedResult<RoleItem>>({
    queryKey: ["roles", params],
    queryFn: async () => {
      const { data } = await api.get<PagedResult<RoleItem>>("/api/roles", { params });
      return data;
    },
  });
}

export function useRoleDetail(id: string | undefined) {
  return useQuery<RoleDetail>({
    queryKey: ["roles", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<RoleDetail>(`/api/roles/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useModulesWithPermissions() {
  return useQuery<ModuleWithPermissions[]>({
    queryKey: ["modules", "with-permissions"],
    queryFn: async () => {
      const { data } = await api.get<ModuleWithPermissions[]>(
        "/api/modules/with-permissions"
      );
      return data;
    },
    staleTime: 10 * 60_000,
  });
}

export interface RoleInput {
  name: string;
  description?: string | null;
  permissionIds: string[];
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RoleInput) => {
      const { data } = await api.post("/api/roles", input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: RoleInput & { id: string }) => {
      await api.patch(`/api/roles/${id}`, input);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["roles"] });
      qc.invalidateQueries({ queryKey: ["roles", "detail", vars.id] });
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/roles/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  PagedResult,
  RoleSelectItem,
  UserDetail,
  UserItem,
} from "@/types/api";

export function useUsersQuery(params: { page: number; pageSize: number }) {
  return useQuery<PagedResult<UserItem>>({
    queryKey: ["users", params],
    queryFn: async () => {
      const { data } = await api.get<PagedResult<UserItem>>("/api/users", { params });
      return data;
    },
  });
}

export function useUserDetail(id: string | undefined) {
  return useQuery<UserDetail>({
    queryKey: ["users", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<UserDetail>(`/api/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useRolesSelect() {
  return useQuery<RoleSelectItem[]>({
    queryKey: ["roles", "select"],
    queryFn: async () => {
      const { data } = await api.get<RoleSelectItem[]>("/api/roles/select");
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: string;
  phone?: string | null;
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      const { data } = await api.post("/api/users", input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: Partial<CreateUserInput> & { id: string; isActive?: boolean }) => {
      await api.patch(`/api/users/${id}`, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

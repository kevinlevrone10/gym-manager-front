"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  ClientDetail,
  ClientListItem,
  ClientSearchItem,
  PagedResult,
} from "@/types/api";

interface ClientsListParams {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
}

export function useClientsQuery(params: ClientsListParams) {
  return useQuery<PagedResult<ClientListItem>>({
    queryKey: ["clients", params],
    queryFn: async () => {
      const { data } = await api.get<PagedResult<ClientListItem>>("/api/clients", {
        params,
      });
      return data;
    },
  });
}

export function useClientDetail(id: string | undefined) {
  return useQuery<ClientDetail>({
    queryKey: ["clients", "detail", id],
    queryFn: async () => {
      const { data } = await api.get<ClientDetail>(`/api/clients/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useClientSearch(query: string) {
  return useQuery<{ items: ClientSearchItem[]; hasMore: boolean }>({
    queryKey: ["clients", "search", query],
    queryFn: async () => {
      const { data } = await api.get<{ items: ClientSearchItem[]; hasMore: boolean }>(
        "/api/clients/search",
        { params: { q: query } }
      );
      return data;
    },
    enabled: query.length >= 2,
  });
}

export interface CreateClientInput {
  fullName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  whatsAppOptIn?: boolean;
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateClientInput) => {
      const { data } = await api.post("/api/clients", input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export interface UpdateClientInput {
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean | null;
  whatsAppOptIn?: boolean | null;
  notes?: string | null;
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateClientInput & { id: string }) => {
      await api.patch(`/api/clients/${id}`, input);
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["clients", "detail", vars.id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/clients/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

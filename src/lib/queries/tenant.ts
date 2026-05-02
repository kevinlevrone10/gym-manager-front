"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TenantMe } from "@/types/api";

export function useTenantQuery() {
  return useQuery<TenantMe>({
    queryKey: ["tenant", "me"],
    queryFn: async () => {
      const { data } = await api.get<TenantMe>("/api/tenant/me");
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

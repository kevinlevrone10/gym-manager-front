"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  MembershipPreview,
  MembershipsByClient,
  PaymentMethod,
  RenewMembershipResponse,
} from "@/types/api";

export function useMembershipsByClient(clientId: string | undefined) {
  return useQuery<MembershipsByClient>({
    queryKey: ["memberships", "client", clientId],
    queryFn: async () => {
      const { data } = await api.get<MembershipsByClient>(
        `/api/memberships/client/${clientId}`
      );
      return data;
    },
    enabled: !!clientId,
  });
}

export function useMembershipPreview(clientId?: string, planId?: string) {
  return useQuery<MembershipPreview>({
    queryKey: ["memberships", "preview", clientId, planId],
    queryFn: async () => {
      const { data } = await api.get<MembershipPreview>("/api/memberships/preview", {
        params: { clientId, planId },
      });
      return data;
    },
    enabled: !!clientId,
  });
}

export interface RenewInput {
  clientId: string;
  planId: string;
  paymentMethod: PaymentMethod;
}

export function useRenewMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RenewInput) => {
      const { data } = await api.post<RenewMembershipResponse>(
        "/api/memberships/renew",
        input
      );
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["memberships", "client", vars.clientId] });
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCancelMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/memberships/${id}/cancel`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memberships"] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

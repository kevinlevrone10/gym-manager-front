"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PagedResult, PaymentItem, PaymentMethod, QuickPaymentResponse } from "@/types/api";

export interface PaymentsListParams {
  page: number;
  pageSize: number;
  from?: string;
  to?: string;
}

export function usePaymentsQuery(params: PaymentsListParams) {
  return useQuery<PagedResult<PaymentItem>>({
    queryKey: ["payments", params],
    queryFn: async () => {
      const { data } = await api.get<PagedResult<PaymentItem>>("/api/payments", {
        params,
      });
      return data;
    },
  });
}

export interface QuickPaymentInput {
  planId: string;
  customerName: string;
  paymentMethod: PaymentMethod;
}

export function useQuickPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: QuickPaymentInput) => {
      const { data } = await api.post<QuickPaymentResponse>(
        "/api/payments/quick",
        input
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

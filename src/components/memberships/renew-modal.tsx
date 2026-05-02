"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, ArrowRight } from "lucide-react";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { usePlansSelect } from "@/lib/queries/plans";
import { useMembershipPreview, useRenewMembership } from "@/lib/queries/memberships";
import { useTenantQuery } from "@/lib/queries/tenant";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentMethod } from "@/types/api";

interface Props {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName?: string;
}

export function RenewModal({ open, onClose, clientId, clientName }: Props) {
  const [planId, setPlanId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const plans = usePlansSelect();
  const tenant = useTenantQuery();
  const preview = useMembershipPreview(clientId, planId || undefined);
  const renew = useRenewMembership();

  useEffect(() => {
    if (!open) {
      setPlanId("");
      setPaymentMethod("cash");
    }
  }, [open]);

  const onConfirm = async () => {
    if (!planId) {
      toast.error("Selecciona un plan");
      return;
    }
    try {
      const res = await renew.mutateAsync({ clientId, planId, paymentMethod });
      toast.success(
        `Membresía renovada. ${formatCurrency(
          res.amount,
          tenant.data?.currency || "NIO"
        )} cobrado.`
      );
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err, "No se pudo renovar la membresía"));
    }
  };

  const planPriceText = (() => {
    if (!planId || !plans.data) return null;
    const p = plans.data.find((x) => x.id === planId);
    return p?.displayText ?? null;
  })();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Renovar membresía"
      description={clientName ? `Cliente: ${clientName}` : undefined}
      className="max-w-xl"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Plan</Label>
          {plans.isLoading ? (
            <Skeleton className="h-10" />
          ) : (
            <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">Selecciona un plan</option>
              {plans.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayText}
                </option>
              ))}
            </Select>
          )}
        </div>

        {preview.isLoading && <Skeleton className="h-24" />}

        {preview.data && (
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <CalendarCheck className="h-4 w-4" />
              Vista previa
            </div>

            {preview.data.lastMembership ? (
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-gray-500 dark:text-gray-400">Última membresía</p>
                <div className="flex items-center gap-2">
                  <span>{preview.data.lastMembership.planName}</span>
                  <span className="text-gray-500">·</span>
                  <span>vence {formatDate(preview.data.lastMembership.endDate)}</span>
                  <Badge
                    variant={
                      preview.data.lastMembership.status === "active" ? "active" : "expired"
                    }
                  >
                    {preview.data.lastMembership.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Cliente sin membresía previa</p>
            )}

            {preview.data.newMembership && (
              <div className="mt-4 flex items-center gap-3 rounded-md bg-green-50 p-3 dark:bg-green-900/20">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-green-700 dark:text-green-400">
                    Nueva membresía
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">
                      {preview.data.newMembership.planName}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span>{formatDate(preview.data.newMembership.startDate)}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{formatDate(preview.data.newMembership.endDate)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Método de pago</Label>
          <Select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="other">Otro</option>
          </Select>
        </div>

        {planPriceText && (
          <div className="rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-800">
            Cobrarás: <span className="font-semibold">{planPriceText}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={renew.isPending}>
            Cancelar
          </Button>
          <Button variant="success" onClick={onConfirm} loading={renew.isPending}>
            Confirmar cobro
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

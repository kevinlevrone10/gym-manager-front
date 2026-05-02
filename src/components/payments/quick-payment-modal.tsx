"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";

import { usePlansSelect } from "@/lib/queries/plans";
import { useQuickPayment } from "@/lib/queries/payments";
import { useTenantQuery } from "@/lib/queries/tenant";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PaymentMethod } from "@/types/api";

const schema = z.object({
  customerName: z.string().min(2, "Nombre requerido"),
  planId: z.string().min(1, "Selecciona un plan"),
  paymentMethod: z.enum(["cash", "card", "transfer", "other"]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function QuickPaymentModal({ open, onClose }: Props) {
  const plans = usePlansSelect();
  const tenant = useTenantQuery();
  const mutation = useQuickPayment();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { customerName: "", planId: "", paymentMethod: "cash" },
  });

  useEffect(() => {
    if (!open) reset({ customerName: "", planId: "", paymentMethod: "cash" });
  }, [open, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await mutation.mutateAsync({
        customerName: values.customerName,
        planId: values.planId,
        paymentMethod: values.paymentMethod as PaymentMethod,
      });
      toast.success(
        `Cobro registrado · ${formatCurrency(res.amount, tenant.data?.currency)}`
      );
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Cobro rápido"
      description="Visita día — sin crear cliente ni membresía"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label>Nombre del visitante</Label>
          <Input placeholder="Juan García" {...register("customerName")} />
          {errors.customerName && (
            <p className="text-xs text-red-600">{errors.customerName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Plan / Tarifa</Label>
          <Select {...register("planId")}>
            <option value="">Selecciona un plan</option>
            {plans.data?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayText}
              </option>
            ))}
          </Select>
          {errors.planId && <p className="text-xs text-red-600">{errors.planId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Método de pago</Label>
          <Select {...register("paymentMethod")}>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="other">Otro</option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" loading={isSubmitting}>
            Cobrar
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Phone, User, Calendar, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientCombobox } from "@/components/memberships/client-combobox";

import { useClientDetail } from "@/lib/queries/clients";
import { usePlansSelect } from "@/lib/queries/plans";
import { useMembershipPreview, useRenewMembership } from "@/lib/queries/memberships";
import { extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { PaymentMethod } from "@/types/api";

export default function MembershipsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <RenewMembershipScreen />
    </Suspense>
  );
}

function RenewMembershipScreen() {
  const sp = useSearchParams();
  const router = useRouter();

  const [clientId, setClientId] = useState(sp.get("clientId") || "");
  const [planId, setPlanId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  const plans = usePlansSelect();
  const detail = useClientDetail(clientId || undefined);
  const preview = useMembershipPreview(clientId || undefined, planId || undefined);
  const renew = useRenewMembership();

  const onSubmit = async () => {
    if (!clientId) {
      toast.error("Selecciona un cliente");
      return;
    }
    if (!planId) {
      toast.error("Selecciona un plan");
      return;
    }
    try {
      await renew.mutateAsync({ clientId, planId, paymentMethod });
      toast.success("Membresía renovada correctamente");
      router.push(`/clients/${clientId}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "No se pudo renovar la membresía"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Renovar Membresía</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registra un pago y renueva la membresía de un cliente
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Datos de la Renovación</CardTitle>
            <CardDescription>Selecciona el cliente, plan y registra el pago</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                Cliente <span className="text-red-500">*</span>
              </Label>
              <ClientCombobox
                value={clientId}
                onChange={(id) => {
                  setClientId(id);
                  const url = id ? `/memberships?clientId=${id}` : "/memberships";
                  router.replace(url);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Plan <span className="text-red-500">*</span>
              </Label>
              <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
                <option value="">Selecciona un plan</option>
                {plans.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayText}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Método de pago <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="sm:max-w-xs"
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="other">Otro</option>
              </Select>
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant="danger"
                onClick={onSubmit}
                loading={renew.isPending}
                disabled={!clientId || !planId}
              >
                <CreditCard className="h-4 w-4" />
                Cobrar y Renovar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {!clientId ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Selecciona un cliente para ver su información y la previsualización de la renovación.
              </p>
            ) : (
              <>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Cliente</p>
                  {detail.isLoading ? (
                    <Skeleton className="h-5 w-32" />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold">
                          {detail.data?.fullName || "—"}
                        </span>
                      </div>
                      {detail.data?.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="font-mono">{detail.data.phone}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2 border-t border-gray-200 pt-4 dark:border-gray-800">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Última membresía
                  </p>
                  {preview.isLoading ? (
                    <Skeleton className="h-12" />
                  ) : preview.data?.lastMembership ? (
                    <div className="space-y-1">
                      <Badge
                        variant={
                          preview.data.lastMembership.status === "active"
                            ? "active"
                            : preview.data.lastMembership.status === "expired"
                              ? "expired"
                              : "neutral"
                        }
                      >
                        {preview.data.lastMembership.status === "active"
                          ? "Activa"
                          : preview.data.lastMembership.status === "expired"
                            ? "Vencida"
                            : preview.data.lastMembership.status}
                      </Badge>
                      <p className="font-medium">
                        {preview.data.lastMembership.planName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vence: {formatDate(preview.data.lastMembership.endDate)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Sin membresía previa</p>
                  )}
                </div>

                {preview.data?.newMembership && (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                    <p className="mb-2 text-sm font-semibold">Nueva membresía</p>
                    <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                      <p>
                        <span className="text-gray-500">Inicia:</span>{" "}
                        <span className="font-medium">
                          {formatDate(preview.data.newMembership.startDate)}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">Vence:</span>{" "}
                        <span className="font-medium">
                          {formatDate(preview.data.newMembership.endDate)}
                        </span>
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{preview.data.newMembership.planName}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

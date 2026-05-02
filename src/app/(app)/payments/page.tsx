"use client";

import { useMemo, useState } from "react";
import { Plus, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { QuickPaymentModal } from "@/components/payments/quick-payment-modal";
import { Pagination } from "@/components/ui/pagination";

import { usePaymentsQuery } from "@/lib/queries/payments";
import { useTenantQuery } from "@/lib/queries/tenant";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  other: "Otro",
};

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);

  const tenant = useTenantQuery();

  const params = useMemo(
    () => ({
      page,
      pageSize: 20,
      from: from || undefined,
      to: to || undefined,
    }),
    [page, from, to]
  );

  const { data, isLoading, error } = usePaymentsQuery(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data ? `${data.total} pagos registrados` : "Cargando..."}
          </p>
        </div>
        <PermissionGuard permission="payments.create">
          <Button variant="success" onClick={() => setQuickOpen(true)}>
            <Plus className="h-4 w-4" /> Cobro rápido
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Desde</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hasta</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            No se pudieron cargar los pagos.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="Sin pagos en el rango"
              description="Cuando cobres una membresía o visita día aparecerá aquí."
              className="border-0"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Monto</th>
                    <th className="px-4 py-3 font-medium">Método</th>
                    <th className="px-4 py-3 font-medium">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                    >
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {formatDateTime(p.paidAt)}
                      </td>
                      <td className="px-4 py-3 font-medium">{p.customerName}</td>
                      <td className="px-4 py-3">
                        {p.isQuickPayment ? (
                          <Badge variant="neutral">Visita día</Badge>
                        ) : (
                          <Badge variant="active">Membresía</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatCurrency(p.amount, tenant.data?.currency)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {PAYMENT_METHOD_LABEL[p.paymentMethod] || p.paymentMethod}
                      </td>
                      <td
                        className="max-w-xs truncate px-4 py-3 text-gray-500 dark:text-gray-400"
                        title={p.notes || undefined}
                      >
                        {p.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {data && (
        <Pagination
          page={page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
          itemLabel="pagos"
        />
      )}

      <QuickPaymentModal open={quickOpen} onClose={() => setQuickOpen(false)} />
    </div>
  );
}

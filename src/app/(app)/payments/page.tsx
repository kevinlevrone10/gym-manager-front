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
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  MobileCardList,
} from "@/components/ui/data-table";

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
            <>
              <DataTable>
                <DataTableHead>
                  <tr>
                    <DataTableHeader>Fecha</DataTableHeader>
                    <DataTableHeader>Cliente</DataTableHeader>
                    <DataTableHeader>Tipo</DataTableHeader>
                    <DataTableHeader>Monto</DataTableHeader>
                    <DataTableHeader>Método</DataTableHeader>
                    <DataTableHeader>Notas</DataTableHeader>
                  </tr>
                </DataTableHead>
                <tbody>
                  {data?.items.map((p) => (
                    <DataTableRow key={p.id}>
                      <DataTableCell className="text-gray-600 dark:text-gray-400">
                        {formatDateTime(p.paidAt)}
                      </DataTableCell>
                      <DataTableCell className="font-medium">{p.customerName}</DataTableCell>
                      <DataTableCell>
                        {p.isQuickPayment ? (
                          <Badge variant="neutral">Visita día</Badge>
                        ) : (
                          <Badge variant="active">Membresía</Badge>
                        )}
                      </DataTableCell>
                      <DataTableCell className="font-mono">
                        {formatCurrency(p.amount, tenant.data?.currency)}
                      </DataTableCell>
                      <DataTableCell className="text-gray-600 dark:text-gray-400">
                        {PAYMENT_METHOD_LABEL[p.paymentMethod] || p.paymentMethod}
                      </DataTableCell>
                      <DataTableCell
                        className="max-w-xs truncate text-gray-500 dark:text-gray-400"
                        title={p.notes || undefined}
                      >
                        {p.notes || "—"}
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </tbody>
              </DataTable>

              <MobileCardList>
                {data?.items.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900 dark:text-gray-100">
                          {p.customerName}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(p.paidAt)}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount, tenant.data?.currency)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      {p.isQuickPayment ? (
                        <Badge variant="neutral">Visita día</Badge>
                      ) : (
                        <Badge variant="active">Membresía</Badge>
                      )}
                      <span className="text-gray-500 dark:text-gray-400">
                        {PAYMENT_METHOD_LABEL[p.paymentMethod] || p.paymentMethod}
                      </span>
                    </div>
                    {p.notes && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {p.notes}
                      </p>
                    )}
                  </div>
                ))}
              </MobileCardList>
            </>
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

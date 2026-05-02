"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, MessageSquare, MoreVertical, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, membershipBadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ClientForm } from "@/components/clients/client-form";
import { PermissionGuard } from "@/components/auth/permission-guard";

import { PageHeader } from "@/components/layout/page-header";
import { Pagination } from "@/components/ui/pagination";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  MobileCardList,
} from "@/components/ui/data-table";
import { useClientsQuery, useDeleteClient } from "@/lib/queries/clients";
import { extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { ClientListItem } from "@/types/api";

function membershipLabel(c: ClientListItem): string {
  if (!c.isActive) return "Inactivo";
  const m = c.membership;
  if (!m) return "Sin membresía";
  const d = m.daysToExpiry;
  if (d < 0) return "Vencida";
  if (d <= 7) return "Por vencer";
  return "Activa";
}

export default function ClientsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteClient, setDeleteClient] = useState<ClientListItem | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      page,
      pageSize: 20,
      search: search || undefined,
      isActive: activeFilter === "all" ? undefined : activeFilter === "active",
    }),
    [page, search, activeFilter]
  );

  const { data, isLoading, error } = useClientsQuery(params);
  const deleteMut = useDeleteClient();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={data ? `${data.total} clientes registrados` : "Cargando..."}
        actions={
          <PermissionGuard permission="clients.create">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </Button>
          </PermissionGuard>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as typeof activeFilter);
              setPage(1);
            }}
            className="sm:w-48"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </Select>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            No se pudieron cargar los clientes.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Sin clientes todavía"
              description="Empieza creando tu primer cliente."
              className="border-0"
              action={
                <PermissionGuard permission="clients.create">
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" /> Nuevo cliente
                  </Button>
                </PermissionGuard>
              }
            />
          ) : (
            <>
              <DataTable>
                <DataTableHead>
                  <tr>
                    <DataTableHeader>Nombre</DataTableHeader>
                    <DataTableHeader>Teléfono</DataTableHeader>
                    <DataTableHeader>Plan</DataTableHeader>
                    <DataTableHeader>Vence</DataTableHeader>
                    <DataTableHeader>Estado</DataTableHeader>
                    <DataTableHeader>Registrado</DataTableHeader>
                    <DataTableHeader className="text-right">Acciones</DataTableHeader>
                  </tr>
                </DataTableHead>
                <tbody>
                  {data?.items.map((c) => {
                    const m = c.membership;
                    const days = m?.daysToExpiry;
                    const variant = c.isActive
                      ? membershipBadgeVariant(days)
                      : "cancelled";
                    return (
                      <DataTableRow key={c.id}>
                        <DataTableCell>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/clients/${c.id}`}
                              className="font-medium text-gray-900 hover:underline dark:text-gray-100"
                            >
                              {c.fullName}
                            </Link>
                            {c.whatsAppOptIn && (
                              <MessageSquare
                                className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                                aria-label="WhatsApp habilitado"
                              />
                            )}
                          </div>
                        </DataTableCell>
                        <DataTableCell className="font-mono text-gray-600 dark:text-gray-400">
                          {c.phone}
                        </DataTableCell>
                        <DataTableCell className="text-gray-600 dark:text-gray-400">
                          {m?.planName ?? "—"}
                        </DataTableCell>
                        <DataTableCell className="text-gray-600 dark:text-gray-400">
                          {m?.endDate ? formatDate(m.endDate) : "—"}
                        </DataTableCell>
                        <DataTableCell>
                          <Badge variant={variant}>{membershipLabel(c)}</Badge>
                        </DataTableCell>
                        <DataTableCell className="text-gray-500 dark:text-gray-400">
                          {formatDate(c.createdAt)}
                        </DataTableCell>
                        <DataTableCell className="text-right">
                          <RowActions
                            client={c}
                            open={menuOpen === c.id}
                            onToggle={() =>
                              setMenuOpen(menuOpen === c.id ? null : c.id)
                            }
                            onClose={() => setMenuOpen(null)}
                            onRenew={() => {
                              setMenuOpen(null);
                              router.push(`/memberships?clientId=${c.id}`);
                            }}
                            onDelete={() => {
                              setDeleteClient(c);
                              setMenuOpen(null);
                            }}
                          />
                        </DataTableCell>
                      </DataTableRow>
                    );
                  })}
                </tbody>
              </DataTable>

              <MobileCardList>
                {data?.items.map((c) => {
                  const m = c.membership;
                  const days = m?.daysToExpiry;
                  const variant = c.isActive
                    ? membershipBadgeVariant(days)
                    : "cancelled";
                  return (
                    <div
                      key={c.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/clients/${c.id}`}
                              className="truncate font-semibold text-gray-900 hover:underline dark:text-gray-100"
                            >
                              {c.fullName}
                            </Link>
                            {c.whatsAppOptIn && (
                              <MessageSquare
                                className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                                aria-label="WhatsApp habilitado"
                              />
                            )}
                          </div>
                          <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                            {c.phone}
                          </p>
                        </div>
                        <RowActions
                          client={c}
                          open={menuOpen === c.id}
                          onToggle={() =>
                            setMenuOpen(menuOpen === c.id ? null : c.id)
                          }
                          onClose={() => setMenuOpen(null)}
                          onRenew={() => {
                            setMenuOpen(null);
                            router.push(`/memberships?clientId=${c.id}`);
                          }}
                          onDelete={() => {
                            setDeleteClient(c);
                            setMenuOpen(null);
                          }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Badge variant={variant}>{membershipLabel(c)}</Badge>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {m?.endDate ? `Vence ${formatDate(m.endDate)}` : "Sin membresía"}
                        </span>
                      </div>

                      {m?.planName && (
                        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          {m.planName}
                        </p>
                      )}
                    </div>
                  );
                })}
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
          itemLabel="clientes"
        />
      )}

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nuevo cliente"
        description="Registra un nuevo socio del gimnasio"
      >
        <ClientForm onSuccess={() => setCreateOpen(false)} />
      </Dialog>

      <ConfirmDialog
        open={!!deleteClient}
        onClose={() => setDeleteClient(null)}
        title="Eliminar cliente"
        description={`¿Estás seguro de eliminar a ${deleteClient?.fullName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        loading={deleteMut.isPending}
        onConfirm={async () => {
          if (!deleteClient) return;
          try {
            await deleteMut.mutateAsync(deleteClient.id);
            toast.success("Cliente eliminado");
            setDeleteClient(null);
          } catch (err) {
            toast.error(extractErrorMessage(err, "No se pudo eliminar"));
          }
        }}
      />
    </div>
  );
}

function RowActions({
  client,
  open,
  onToggle,
  onClose,
  onRenew,
  onDelete,
}: {
  client: ClientListItem;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onRenew: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Más opciones"
        className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div className="absolute right-0 top-8 z-20 w-44 rounded-md border border-gray-200 bg-white text-left shadow-lg dark:border-gray-800 dark:bg-gray-900">
            <Link
              href={`/clients/${client.id}`}
              className="block w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={onClose}
            >
              Ver detalle
            </Link>
            <PermissionGuard permission={["memberships.create", "memberships.renew"]}>
              <button
                type="button"
                onClick={onRenew}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Renovar membresía
              </button>
            </PermissionGuard>
            <PermissionGuard permission="clients.delete">
              <button
                type="button"
                onClick={onDelete}
                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Eliminar
              </button>
            </PermissionGuard>
          </div>
        </>
      )}
    </div>
  );
}

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
                    <th className="px-4 py-3 font-medium">Nombre</th>
                    <th className="px-4 py-3 font-medium">Teléfono</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Vence</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium">Registrado</th>
                    <th className="px-4 py-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((c) => {
                    const m = c.membership;
                    const days = m?.daysToExpiry;
                    const variant = c.isActive
                      ? membershipBadgeVariant(days)
                      : "cancelled";
                    return (
                      <tr
                        key={c.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/clients/${c.id}`}
                              className="font-medium text-gray-900 hover:underline dark:text-gray-100"
                            >
                              {c.fullName}
                            </Link>
                            {c.whatsAppOptIn && (
                              <MessageSquare
                                className="h-3.5 w-3.5 shrink-0 text-green-600"
                                aria-label="WhatsApp habilitado"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                          {c.phone}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {m?.planName ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                          {m?.endDate ? formatDate(m.endDate) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={variant}>{membershipLabel(c)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          {formatDate(c.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
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
                        </td>
                      </tr>
                    );
                  })}
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

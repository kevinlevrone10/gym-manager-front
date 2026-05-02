"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, MessageSquare, Phone, Mail, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, membershipBadgeVariant } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ClientForm } from "@/components/clients/client-form";
import { RenewModal } from "@/components/memberships/renew-modal";
import { PermissionGuard } from "@/components/auth/permission-guard";

import { useClientDetail, useDeleteClient } from "@/lib/queries/clients";
import { useMembershipsByClient, useCancelMembership } from "@/lib/queries/memberships";
import { extractErrorMessage } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const detail = useClientDetail(id);
  const memberships = useMembershipsByClient(id);
  const deleteMut = useDeleteClient();
  const cancelMut = useCancelMembership();

  const [editOpen, setEditOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  if (detail.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (detail.error || !detail.data) {
    return (
      <div className="space-y-4">
        <Link href="/clients" className="inline-flex items-center gap-2 text-sm text-gray-600">
          <ArrowLeft className="h-4 w-4" /> Volver a clientes
        </Link>
        <p className="text-sm text-red-600">No se pudo cargar el cliente.</p>
      </div>
    );
  }

  const client = detail.data;
  const list = memberships.data?.memberships ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a clientes
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-xl font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {getInitials(client.fullName)}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{client.fullName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {client.phone}
                  </span>
                  {client.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {client.email}
                    </span>
                  )}
                  {client.whatsAppOptIn && (
                    <Badge variant="active">
                      <MessageSquare className="mr-1 h-3 w-3 inline" />
                      WhatsApp
                    </Badge>
                  )}
                  {!client.isActive && <Badge variant="cancelled">Inactivo</Badge>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <PermissionGuard permission={["memberships.create", "memberships.renew"]}>
                <Button variant="success" onClick={() => setRenewOpen(true)}>
                  Renovar membresía
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="clients.update">
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="clients.delete">
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {client.notes && (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-gray-50 p-3 text-sm dark:bg-gray-800">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
              <p className="text-gray-700 dark:text-gray-300">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de membresías</CardTitle>
        </CardHeader>
        <CardContent>
          {memberships.isLoading ? (
            <Skeleton className="h-24" />
          ) : list.length === 0 ? (
            <p className="text-sm text-gray-500">Sin histórico</p>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-gray-800">
                      <th className="py-2 pr-4">Plan</th>
                      <th className="py-2 pr-4">Inicio</th>
                      <th className="py-2 pr-4">Fin</th>
                      <th className="py-2 pr-4">Estado</th>
                      <th className="py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((m) => (
                      <tr key={m.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 pr-4 font-medium">{m.planName}</td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {formatDate(m.startDate)}
                        </td>
                        <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                          {formatDate(m.endDate)}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={membershipBadgeVariant(0, m.status)}>
                            {m.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          {(m.status === "active" || m.status === "pending") && (
                            <PermissionGuard permission="memberships.cancel">
                              <button
                                type="button"
                                onClick={() => setConfirmCancel(m.id)}
                                className="text-xs text-rose-600 hover:underline"
                              >
                                Cancelar
                              </button>
                            </PermissionGuard>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {list.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.planName}</p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(m.startDate)} → {formatDate(m.endDate)}
                        </p>
                      </div>
                      <Badge variant={membershipBadgeVariant(0, m.status)}>
                        {m.status}
                      </Badge>
                    </div>
                    {(m.status === "active" || m.status === "pending") && (
                      <PermissionGuard permission="memberships.cancel">
                        <button
                          type="button"
                          onClick={() => setConfirmCancel(m.id)}
                          className="mt-2 text-xs text-rose-600 hover:underline"
                        >
                          Cancelar membresía
                        </button>
                      </PermissionGuard>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Editar cliente">
        <ClientForm initial={client} onSuccess={() => setEditOpen(false)} />
      </Dialog>

      <RenewModal
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        clientId={client.id}
        clientName={client.fullName}
      />

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Eliminar cliente"
        description={`¿Eliminar a ${client.fullName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        loading={deleteMut.isPending}
        onConfirm={async () => {
          try {
            await deleteMut.mutateAsync(client.id);
            toast.success("Cliente eliminado");
            router.push("/clients");
          } catch (err) {
            toast.error(extractErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        title="Cancelar membresía"
        description="¿Cancelar esta membresía?"
        confirmText="Cancelar membresía"
        loading={cancelMut.isPending}
        onConfirm={async () => {
          if (!confirmCancel) return;
          try {
            await cancelMut.mutateAsync(confirmCancel);
            toast.success("Membresía cancelada");
            setConfirmCancel(null);
          } catch (err) {
            toast.error(extractErrorMessage(err));
          }
        }}
      />
    </div>
  );
}

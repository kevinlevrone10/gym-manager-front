"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import {
  DataTable,
  DataTableCell,
  DataTableHead,
  DataTableHeader,
  DataTableRow,
  MobileCardList,
} from "@/components/ui/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionGuard } from "@/components/auth/permission-guard";

import {
  useRolesQuery,
  useRoleDetail,
  useModulesWithPermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "@/lib/queries/roles";
import { extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { RoleItem } from "@/types/api";

export default function RolesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useRolesQuery({ page, pageSize: 20 });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [deleting, setDeleting] = useState<RoleItem | null>(null);
  const deleteMut = useDeleteRole();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles y permisos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define qué puede hacer cada usuario
          </p>
        </div>
        <PermissionGuard permission="roles.create">
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Nuevo rol
          </Button>
        </PermissionGuard>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            No se pudieron cargar los roles.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <EmptyState icon={Shield} title="Sin roles" className="border-0" />
          ) : (
            <>
              <DataTable>
                <DataTableHead>
                  <tr>
                    <DataTableHeader>Nombre</DataTableHeader>
                    <DataTableHeader>Descripción</DataTableHeader>
                    <DataTableHeader>Permisos</DataTableHeader>
                    <DataTableHeader>Creado</DataTableHeader>
                    <DataTableHeader className="text-right">Acciones</DataTableHeader>
                  </tr>
                </DataTableHead>
                <tbody>
                  {data?.items.map((r) => (
                    <DataTableRow key={r.id}>
                      <DataTableCell className="font-medium">{r.name}</DataTableCell>
                      <DataTableCell className="text-gray-600 dark:text-gray-400">
                        {r.description || "—"}
                      </DataTableCell>
                      <DataTableCell>
                        <Badge variant="neutral">{r.permissionsCount}</Badge>
                      </DataTableCell>
                      <DataTableCell className="text-gray-600 dark:text-gray-400">
                        {formatDate(r.createdAt)}
                      </DataTableCell>
                      <DataTableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <PermissionGuard permission="roles.update">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission="roles.delete">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleting(r)}
                              className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </tbody>
              </DataTable>

              <MobileCardList>
                {data?.items.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{r.name}</p>
                        {r.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                            {r.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <PermissionGuard permission="roles.update">
                          <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="roles.delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleting(r)}
                            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="neutral">{r.permissionsCount} permisos</Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
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
          itemLabel="roles"
        />
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="Nuevo rol"
        className="max-w-2xl"
      >
        <RoleForm onSuccess={() => setCreating(false)} />
      </Dialog>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar rol"
        className="max-w-2xl"
      >
        {editing && (
          <RoleForm roleId={editing.id} onSuccess={() => setEditing(null)} />
        )}
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Eliminar rol"
        description={`¿Eliminar el rol "${deleting?.name}"? Los usuarios con este rol perderán sus permisos.`}
        loading={deleteMut.isPending}
        confirmText="Eliminar"
        onConfirm={async () => {
          if (!deleting) return;
          try {
            await deleteMut.mutateAsync(deleting.id);
            toast.success("Rol eliminado");
            setDeleting(null);
          } catch (err) {
            toast.error(extractErrorMessage(err));
          }
        }}
      />
    </div>
  );
}

const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

type RoleValues = z.infer<typeof roleSchema>;

function RoleForm({ roleId, onSuccess }: { roleId?: string; onSuccess: () => void }) {
  const isEdit = !!roleId;
  const detail = useRoleDetail(roleId);
  const modules = useModulesWithPermissions();
  const create = useCreateRole();
  const update = useUpdateRole();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    values: detail.data
      ? { name: detail.data.name, description: detail.data.description || "" }
      : undefined,
  });

  useEffect(() => {
    if (detail.data) {
      const ids = new Set<string>();
      for (const m of detail.data.modules) {
        for (const p of m.permissions) {
          if (p.isSelected) ids.add(p.id);
        }
      }
      setSelected(ids);
    }
  }, [detail.data]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModule = (moduleCode: string, allIds: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = allIds.every((id) => next.has(id));
      if (allSelected) {
        for (const id of allIds) next.delete(id);
      } else {
        for (const id of allIds) next.add(id);
      }
      return next;
    });
  };

  const onSubmit = async (values: RoleValues) => {
    try {
      const payload = {
        name: values.name,
        description: values.description || null,
        permissionIds: Array.from(selected),
      };
      if (isEdit && roleId) {
        await update.mutateAsync({ id: roleId, ...payload });
        toast.success("Rol actualizado");
      } else {
        await create.mutateAsync(payload);
        toast.success("Rol creado");
      }
      onSuccess();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  if (isEdit && detail.isLoading) return <Skeleton className="h-64" />;

  const groups = isEdit
    ? detail.data?.modules.map((m) => ({
        code: m.moduleCode,
        name: m.moduleName,
        permissions: m.permissions.map((p) => ({ id: p.id, name: p.name })),
      })) || []
    : modules.data?.map((m) => ({
        code: m.code,
        name: m.name,
        permissions: m.permissions.map((p) => ({ id: p.id, name: p.name })),
      })) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre del rol</Label>
        <Input placeholder="Cajero" {...register("name")} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea placeholder="Operación diaria" {...register("description")} />
      </div>

      <div>
        <Label className="mb-2 block">Permisos</Label>
        <div className="max-h-80 space-y-3 overflow-y-auto rounded-md border border-gray-200 p-3 dark:border-gray-800">
          {groups.length === 0 && <Skeleton className="h-32" />}
          {groups.map((g) => {
            const allIds = g.permissions.map((p) => p.id);
            const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
            return (
              <div
                key={g.code}
                className="rounded-md border border-gray-100 p-3 dark:border-gray-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">{g.name}</p>
                  <button
                    type="button"
                    onClick={() => toggleModule(g.code, allIds)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {allSelected ? "Desmarcar todo" : "Marcar todo"}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {g.permissions.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggle(p.id)}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {selected.size} permisos seleccionados
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Guardar cambios" : "Crear rol"}
        </Button>
      </div>
    </form>
  );
}

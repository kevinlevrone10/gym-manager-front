"use client";

import { useState } from "react";
import { Plus, Pencil, UserCog } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { PermissionGuard } from "@/components/auth/permission-guard";

import {
  useUsersQuery,
  useCreateUser,
  useUpdateUser,
  useRolesSelect,
  useUserDetail,
} from "@/lib/queries/users";
import { extractErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { UserItem } from "@/types/api";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useUsersQuery({ page, pageSize: 20 });
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona el equipo del gimnasio
          </p>
        </div>
        <PermissionGuard permission="users.create">
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Nuevo usuario
          </Button>
        </PermissionGuard>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            No se pudieron cargar los usuarios.
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
            <EmptyState icon={UserCog} title="Sin usuarios" className="border-0" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-gray-800">
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant="neutral">{u.roleName}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? "active" : "cancelled"}>
                        {u.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <PermissionGuard permission="users.update">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(u)}>
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Button>
                      </PermissionGuard>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {data && (
        <Pagination
          page={page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
          itemLabel="usuarios"
        />
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="Nuevo usuario"
      >
        <UserForm onSuccess={() => setCreating(false)} />
      </Dialog>

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar usuario"
      >
        {editing && (
          <UserEditForm userId={editing.id} onSuccess={() => setEditing(null)} />
        )}
      </Dialog>
    </div>
  );
}

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  roleId: z.string().min(1, "Selecciona un rol"),
  phone: z.string().optional(),
});

type UserValues = z.infer<typeof userSchema>;

function UserForm({ onSuccess }: { onSuccess: () => void }) {
  const roles = useRolesSelect();
  const create = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "", roleId: "", phone: "" },
  });

  const onSubmit = async (values: UserValues) => {
    try {
      await create.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        roleId: values.roleId,
        phone: values.phone || null,
      });
      toast.success("Usuario creado");
      onSuccess();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input {...register("name")} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input {...register("phone")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Contraseña inicial</Label>
        <Input type="password" {...register("password")} />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Rol</Label>
        <Select {...register("roleId")}>
          <option value="">Selecciona un rol</option>
          {roles.data?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        {errors.roleId && <p className="text-xs text-red-600">{errors.roleId.message}</p>}
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting}>
          Crear usuario
        </Button>
      </div>
    </form>
  );
}

const editSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  roleId: z.string().min(1),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

type EditValues = z.infer<typeof editSchema>;

function UserEditForm({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const detail = useUserDetail(userId);
  const roles = useRolesSelect();
  const update = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: detail.data
      ? {
          name: detail.data.name,
          email: detail.data.email,
          roleId: detail.data.roleId,
          phone: detail.data.phone || "",
          isActive: detail.data.isActive,
        }
      : undefined,
  });

  if (detail.isLoading) return <Skeleton className="h-32" />;

  const onSubmit = async (values: EditValues) => {
    try {
      await update.mutateAsync({
        id: userId,
        name: values.name,
        email: values.email,
        roleId: values.roleId,
        phone: values.phone || null,
        isActive: values.isActive,
      });
      toast.success("Usuario actualizado");
      onSuccess();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input {...register("name")} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" {...register("email")} />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input {...register("phone")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Rol</Label>
        <Select {...register("roleId")}>
          {roles.data?.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("isActive")} />
        Usuario activo
      </label>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting}>
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}

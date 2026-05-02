"use client";

import { useState } from "react";
import { Plus, Pencil, EyeOff, Eye, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input, Label } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { PermissionGuard } from "@/components/auth/permission-guard";

import {
  usePlansQuery,
  useCreatePlan,
  useUpdatePlan,
  type PlanInput,
} from "@/lib/queries/plans";
import { useTenantQuery } from "@/lib/queries/tenant";
import { extractErrorMessage } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { PlanItem } from "@/types/api";

export default function PlansPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = usePlansQuery({ page, pageSize: 20 });
  const tenant = useTenantQuery();
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planes</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configura los planes de membresía de tu gimnasio
          </p>
        </div>
        <PermissionGuard permission="plans.create">
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Nuevo plan
          </Button>
        </PermissionGuard>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            No se pudieron cargar los planes.
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
            <EmptyState
              icon={Package}
              title="Sin planes"
              description="Crea tu primer plan de membresía."
              className="border-0"
              action={
                <PermissionGuard permission="plans.create">
                  <Button onClick={() => setCreating(true)}>
                    <Plus className="h-4 w-4" /> Nuevo plan
                  </Button>
                </PermissionGuard>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-gray-800">
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Duración</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                    >
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {p.durationDays} días
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {formatCurrency(p.price, tenant.data?.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.isActive ? "active" : "cancelled"}>
                          {p.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <PermissionGuard permission="plans.update">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditing(p)}
                            >
                              <Pencil className="h-3.5 w-3.5" /> Editar
                            </Button>
                            <ToggleActiveButton plan={p} />
                          </div>
                        </PermissionGuard>
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
          itemLabel="planes"
        />
      )}

      <Dialog
        open={creating || !!editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        title={editing ? "Editar plan" : "Nuevo plan"}
      >
        <PlanForm
          initial={editing || undefined}
          onSuccess={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      </Dialog>
    </div>
  );
}

function ToggleActiveButton({ plan }: { plan: PlanItem }) {
  const update = useUpdatePlan();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await update.mutateAsync({ id: plan.id, isActive: !plan.isActive });
          toast.success(plan.isActive ? "Plan desactivado" : "Plan activado");
        } catch (err) {
          toast.error(extractErrorMessage(err));
        } finally {
          setLoading(false);
        }
      }}
    >
      {plan.isActive ? (
        <>
          <EyeOff className="h-3.5 w-3.5" /> Desactivar
        </>
      ) : (
        <>
          <Eye className="h-3.5 w-3.5" /> Activar
        </>
      )}
    </Button>
  );
}

const planSchema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  durationDays: z.coerce.number().int().positive("Debe ser un número positivo"),
  price: z.coerce.number().nonnegative("Precio inválido"),
});

type PlanFormValues = z.infer<typeof planSchema>;

function PlanForm({ initial, onSuccess }: { initial?: PlanItem; onSuccess: () => void }) {
  const create = useCreatePlan();
  const update = useUpdatePlan();
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initial?.name || "",
      durationDays: initial?.durationDays || 30,
      price: initial?.price || 0,
    },
  });

  const onSubmit = async (values: PlanFormValues) => {
    try {
      const payload: PlanInput = {
        name: values.name,
        durationDays: values.durationDays,
        price: values.price,
      };
      if (isEdit) {
        await update.mutateAsync({ id: initial!.id, ...payload });
        toast.success("Plan actualizado");
      } else {
        await create.mutateAsync(payload);
        toast.success("Plan creado");
      }
      onSuccess();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input placeholder="Mensual" {...register("name")} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duración (días)</Label>
          <Input type="number" {...register("durationDays")} />
          {errors.durationDays && (
            <p className="text-xs text-red-600">{errors.durationDays.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Precio</Label>
          <Input type="number" step="0.01" {...register("price")} />
          {errors.price && (
            <p className="text-xs text-red-600">{errors.price.message}</p>
          )}
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Guardar" : "Crear plan"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Globe, CreditCard, KeyRound, Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

import { useTenantQuery } from "@/lib/queries/tenant";
import { changePassword } from "@/lib/auth-api";
import { extractErrorMessage } from "@/lib/api";
import type { PlanCode } from "@/types/api";

const planMeta: Record<PlanCode, { label: string; variant: "free" | "basic" | "essential" | "plus"; description: string }> = {
  free: {
    label: "FREE",
    variant: "free",
    description: "Hasta 10 clientes, 1 usuario y 10 pagos.",
  },
  basic: {
    label: "BASIC",
    variant: "basic",
    description: "Hasta 50 clientes, pagos ilimitados y dashboard.",
  },
  essential: {
    label: "ESSENTIAL",
    variant: "essential",
    description: "Hasta 200 clientes, 2 usuarios y notificaciones por WhatsApp.",
  },
  plus: {
    label: "PLUS",
    variant: "plus",
    description: "Acceso completo a todas las funcionalidades del sistema.",
  },
};

const currencyLabel: Record<string, string> = {
  NIO: "Córdoba Nicaragüense (C$)",
  USD: "Dólar Estadounidense ($)",
};

export default function TenantPage() {
  const tenant = useTenantQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configura los ajustes de tu gimnasio
        </p>
      </div>

      {tenant.isLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : tenant.error ? (
        <Card>
          <CardContent className="p-4 text-sm text-red-600">
            No se pudo cargar la configuración del tenant.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard icon={Building2} title="Datos del Gimnasio" description="Información básica del establecimiento">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre del gimnasio</Label>
                  <Input value={tenant.data?.name || ""} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={tenant.data?.slug || ""}
                    readOnly
                    disabled
                    className="font-mono"
                  />
                  <p className="flex items-center gap-1 text-xs text-gray-500">
                    <Lock className="h-3 w-3" />
                    El slug es único y no puede ser modificado.
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Globe} title="Configuración Regional" description="Zona horaria y moneda">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Zona horaria</Label>
                  <Input value={tenant.data?.timeZone || ""} readOnly disabled />
                  <p className="text-xs text-gray-500">
                    Las fechas y horas se mostrarán según esta zona.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Input
                    value={
                      currencyLabel[tenant.data?.currency || ""] ||
                      tenant.data?.currency ||
                      ""
                    }
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Los precios se mostrarán con el símbolo de esta moneda.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard
            icon={CreditCard}
            title="Plan de Suscripción"
            description="Tu plan actual y estado de suscripción"
          >
            {tenant.data && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-800/40">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Plan Actual:
                      </span>
                      <Badge variant={planMeta[tenant.data.plan].variant}>
                        {planMeta[tenant.data.plan].label}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {planMeta[tenant.data.plan].description}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-right">
                    Para cambiar tu plan,
                    <br className="hidden sm:block" />
                    contacta al administrador
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={KeyRound}
            title="Seguridad"
            description="Cambia tu contraseña de acceso"
          >
            <ChangePasswordForm />
          </SectionCard>
        </>
      )}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Requerido"),
    newPassword: z.string().min(8, "Mínimo 8 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, {
    path: ["confirm"],
    message: "No coincide",
  });

type PasswordValues = z.infer<typeof passwordSchema>;

function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (values: PasswordValues) => {
    setLoading(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      toast.success("Contraseña actualizada");
      reset();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      <div className="space-y-2">
        <Label>Contraseña actual</Label>
        <Input type="password" autoComplete="current-password" {...register("currentPassword")} />
        {errors.currentPassword && (
          <p className="text-xs text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Nueva contraseña</Label>
        <Input type="password" autoComplete="new-password" {...register("newPassword")} />
        {errors.newPassword && (
          <p className="text-xs text-red-600">{errors.newPassword.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Confirmar</Label>
        <Input type="password" autoComplete="new-password" {...register("confirm")} />
        {errors.confirm && <p className="text-xs text-red-600">{errors.confirm.message}</p>}
      </div>
      <div className="flex justify-end sm:col-span-3">
        <Button type="submit" loading={loading}>
          Actualizar contraseña
        </Button>
      </div>
    </form>
  );
}

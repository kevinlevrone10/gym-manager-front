"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Dumbbell, Sparkles, ShieldCheck, Zap, ArrowRight, AlertCircle } from "lucide-react";

import { login } from "@/lib/auth-api";
import { extractErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const data = await login(values.email, values.password);
      setUser(data.user);
      toast.success(`Bienvenido, ${data.user.name}`);
      router.replace("/dashboard");
    } catch (err) {
      const msg = extractErrorMessage(err, "Error al iniciar sesión");
      if (
        msg.toLowerCase().includes("suspendid") ||
        msg.toLowerCase().includes("deshabilitad")
      ) {
        setBlockedMessage(msg);
      } else {
        toast.error(msg);
      }
    }
  };

  if (blockedMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-200/50 bg-white p-8 text-center shadow-soft dark:border-rose-900/40 dark:bg-gray-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">Acceso bloqueado</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{blockedMessage}</p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => setBlockedMessage(null)}
          >
            Volver al login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12 gradient-brand text-white">
        <div className="absolute inset-0 surface-grid opacity-20" />
        <div
          className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/30">
            <Dumbbell className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">GymManager</span>
        </div>

        <div className="relative z-10 max-w-md space-y-8">
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
              Lleva tu gimnasio
              <br />
              al siguiente nivel.
            </h1>
            <p className="mt-4 text-base text-white/80">
              Gestioná socios, membresías, cobros y notificaciones automáticas
              en una sola plataforma.
            </p>
          </div>

          <div className="space-y-3">
            <Feature icon={ShieldCheck}>Histórico inmutable de pagos</Feature>
            <Feature icon={Zap}>Renovaciones encadenadas en un click</Feature>
            <Feature icon={Sparkles}>WhatsApp automático con plan Plus</Feature>
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} GymManager · Hecho para gimnasios LATAM.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-1 items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-glow">
                <Dumbbell className="h-4 w-4" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight">
                GymManager
              </span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Iniciá sesión
          </h2>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Ingresá con la cuenta de tu gimnasio para continuar.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu-gym@gmail.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
              Entrar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            ¿Problemas para entrar? Contactá al administrador del gimnasio.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, children }: { icon: typeof Sparkles; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/90">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
        <Icon className="h-3.5 w-3.5" />
      </span>
      {children}
    </div>
  );
}

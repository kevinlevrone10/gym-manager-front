"use client";

import { BarChart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen del estado actual de tu gimnasio"
      />

      <Card className="overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/30 dark:via-gray-900 dark:to-violet-950/30" />
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <Badge variant="info" withDot={false} className="mb-4">
              <Sparkles className="h-3 w-3" />
              Próximamente
            </Badge>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-brand text-white shadow-glow">
              <BarChart className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
              Muy pronto
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Estamos preparando un panel con tus indicadores clave: socios
              activos, vencimientos, retención y cobros del día.
            </p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

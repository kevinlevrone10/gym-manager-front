"use client";

import { TrendingUp, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

export default function MetricasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Métricas"
        description="Análisis avanzado del gimnasio · plan Plus"
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
              <TrendingUp className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-display text-xl font-semibold tracking-tight">
              Muy pronto
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Revenue mensual, retención, churn y top planes vendidos — todo
              en gráficos interactivos.
            </p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

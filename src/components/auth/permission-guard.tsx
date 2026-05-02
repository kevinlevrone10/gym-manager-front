"use client";

import { useAuthStore } from "@/stores/auth-store";

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hasPermission = useAuthStore((s) => s.hasPermission);
  const codes = Array.isArray(permission) ? permission : [permission];
  const ok = codes.some((c) => hasPermission(c));
  if (!ok) return <>{fallback}</>;
  return <>{children}</>;
}

export function ModuleGuard({
  module,
  children,
  fallback = null,
}: {
  module: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hasModule = useAuthStore((s) => s.hasModule);
  if (!hasModule(module)) return <>{fallback}</>;
  return <>{children}</>;
}

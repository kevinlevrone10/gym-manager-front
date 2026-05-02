"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Package,
  CreditCard,
  DollarSign,
  Bell,
  BarChart,
  TrendingUp,
  UserCog,
  Shield,
  Building2,
  Dumbbell,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth-store";
import { useTenantQuery } from "@/lib/queries/tenant";
import { cn } from "@/lib/utils";

interface NavItem {
  code: string;
  href: string;
  icon: LucideIcon;
  group: "main" | "admin" | "system";
}

const ALL_ITEMS: NavItem[] = [
  { code: "dashboard", href: "/dashboard", icon: BarChart, group: "main" },
  { code: "clients", href: "/clients", icon: Users, group: "main" },
  { code: "memberships", href: "/memberships", icon: CreditCard, group: "main" },
  { code: "payments", href: "/payments", icon: DollarSign, group: "main" },
  { code: "plans", href: "/plans", icon: Package, group: "main" },
  { code: "notifications", href: "/notifications", icon: Bell, group: "main" },
  { code: "metricas", href: "/metricas", icon: TrendingUp, group: "main" },
  { code: "users", href: "/users", icon: UserCog, group: "admin" },
  { code: "roles", href: "/roles", icon: Shield, group: "admin" },
  { code: "tenant", href: "/tenant", icon: Building2, group: "system" },
];

const GROUP_LABELS: Record<NavItem["group"], string> = {
  main: "Principal",
  admin: "Administración",
  system: "Cuenta",
};

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const tenant = useTenantQuery();

  if (!user) return null;

  const visible = ALL_ITEMS.filter((item) =>
    user.modules.some((m) => m.code === item.code)
  );

  const byGroup = (g: NavItem["group"]) =>
    visible.filter((item) => item.group === g);

  const planLabel = tenant.data?.plan?.toUpperCase() ?? "";

  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200/80 bg-white dark:border-gray-800/80 dark:bg-gray-900">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-200/80 px-5 dark:border-gray-800/80">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-glow">
          <Dumbbell className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold tracking-tight">
            {tenant.data?.name ?? "GymManager"}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {tenant.data?.slug ? `@${tenant.data.slug}` : "Cargando..."}
          </p>
        </div>
      </div>

      {/* Plan banner */}
      {planLabel && (
        <div className="px-5 pt-4">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
              tenant.data?.plan === "plus"
                ? "gradient-brand text-white shadow-sm"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Plan {planLabel}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 pt-4">
        {(["main", "admin", "system"] as const).map((group) => {
          const items = byGroup(group);
          if (items.length === 0) return null;
          return (
            <div key={group} className="mb-5">
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {GROUP_LABELS[group]}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const moduleName =
                    user.modules.find((m) => m.code === item.code)?.name ??
                    item.code;
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.code}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-950/50 dark:text-indigo-300"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          active
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                        )}
                      />
                      <span className="flex-1 truncate">{moduleName}</span>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-gray-200/80 px-5 py-3 text-[11px] text-gray-400 dark:border-gray-800/80">
        v0.1.0 · MVP
      </div>
    </aside>
  );
}

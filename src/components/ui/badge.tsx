import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant =
  | "active"
  | "expiring"
  | "expired"
  | "pending"
  | "cancelled"
  | "none"
  | "neutral"
  | "free"
  | "basic"
  | "essential"
  | "plus"
  | "info";

const variantClasses: Record<BadgeVariant, { bg: string; dot: string }> = {
  active: {
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  expiring: {
    bg: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500",
  },
  expired: {
    bg: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-400/20",
    dot: "bg-rose-500",
  },
  pending: {
    bg: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-400/20",
    dot: "bg-sky-500",
  },
  cancelled: {
    bg: "bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-400/20",
    dot: "bg-gray-400",
  },
  none: {
    bg: "bg-gray-50 text-gray-600 ring-gray-400/20 dark:bg-gray-900 dark:text-gray-400 dark:ring-gray-500/20",
    dot: "bg-gray-300",
  },
  neutral: {
    bg: "bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-400/20",
    dot: "bg-gray-400",
  },
  info: {
    bg: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-400/20",
    dot: "bg-indigo-500",
  },
  free: {
    bg: "bg-gray-100 text-gray-700 ring-gray-500/20 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-400/20",
    dot: "bg-gray-400",
  },
  basic: {
    bg: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-400/20",
    dot: "bg-sky-500",
  },
  essential: {
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
  },
  plus: {
    bg: "bg-gradient-to-r from-indigo-500 to-violet-600 text-white ring-indigo-500/30 shadow-sm",
    dot: "bg-white/80",
  },
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  withDot?: boolean;
}

export function Badge({
  className,
  variant = "neutral",
  withDot = true,
  children,
  ...props
}: BadgeProps) {
  const v = variantClasses[variant];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        v.bg,
        className
      )}
      {...props}
    >
      {withDot && variant !== "plus" && (
        <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
      )}
      {children}
    </span>
  );
}

export function membershipBadgeVariant(
  daysToExpiry: number | undefined | null,
  status?: string
): BadgeVariant {
  if (status === "cancelled") return "cancelled";
  if (status === "pending") return "pending";
  if (daysToExpiry === undefined || daysToExpiry === null) return "none";
  if (daysToExpiry < 0) return "expired";
  if (daysToExpiry <= 7) return "expiring";
  return "active";
}

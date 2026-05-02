import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center dark:border-gray-800",
        className
      )}
    >
      {Icon && (
        <div className="relative mb-4">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 blur-2xl dark:from-indigo-950 dark:to-violet-950" />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

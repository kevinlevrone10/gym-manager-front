import * as React from "react";
import { cn } from "@/lib/utils";

export function DataTable({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="hidden md:block">
      <div className="overflow-x-auto">
        <table className={cn("w-full text-sm", className)} {...props} />
      </div>
    </div>
  );
}

export function DataTableHead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
}

export function DataTableHeader({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("px-4 py-3 font-medium", className)} {...props} />;
}

export function DataTableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60 dark:border-gray-800 dark:hover:bg-gray-800/40",
        className
      )}
      {...props}
    />
  );
}

export function DataTableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3", className)} {...props} />;
}

/** Wrapper for the mobile card grid that mirrors the desktop table. */
export function MobileCardList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-3 p-3 md:hidden", className)} {...props} />
  );
}

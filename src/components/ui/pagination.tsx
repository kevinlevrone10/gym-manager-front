"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel = "items",
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (total <= pageSize) return null;

  const pages = getPageList(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 text-sm sm:flex-row",
        className
      )}
    >
      <p className="text-gray-500 dark:text-gray-400">
        Mostrando <span className="font-medium text-gray-900 dark:text-gray-100">{from}</span>
        <span className="mx-1">–</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{to}</span>
        <span className="mx-1">de</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{total}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <PageButton
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`gap-${i}`}
              className="px-2 text-gray-400"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PageButton
              key={p}
              onClick={() => onPageChange(p)}
              active={p === page}
              aria-label={`Página ${p}`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </PageButton>
          )
        )}

        <PageButton
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  active,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950",
        active
          ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function getPageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push("…");
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}

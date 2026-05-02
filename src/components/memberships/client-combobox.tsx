"use client";

import { useEffect, useRef, useState } from "react";
import { Search, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useClientDetail, useClientSearch } from "@/lib/queries/clients";

interface Props {
  value: string;
  onChange: (id: string, name: string) => void;
}

export function ClientCombobox({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const detail = useClientDetail(value || undefined);
  const search = useClientSearch(query);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectedName = detail.data?.fullName || "";
  const displayValue = open ? query : selectedName;

  const select = (id: string, name: string) => {
    onChange(id, name);
    setQuery("");
    setOpen(false);
  };

  const clear = () => {
    onChange("", "");
    setQuery("");
  };

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Input
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar cliente por nombre o teléfono..."
          className="pr-9"
        />
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {value ? (
            <button
              type="button"
              onClick={clear}
              aria-label="Limpiar"
              className="pointer-events-auto rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <User className="h-4 w-4" />
          )}
        </div>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {query.length < 2 ? (
            <div className="flex items-center gap-2 p-3 text-sm text-gray-500">
              <Search className="h-4 w-4" />
              Escribe al menos 2 caracteres para buscar
            </div>
          ) : search.isLoading ? (
            <div className="p-3 text-sm text-gray-500">Buscando...</div>
          ) : search.data?.items.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">
              Sin resultados para &quot;{query}&quot;
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {search.data?.items.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => select(c.id, c.fullName)}
                    className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm font-medium">{c.fullName}</span>
                    <span className="font-mono text-xs text-gray-500">{c.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

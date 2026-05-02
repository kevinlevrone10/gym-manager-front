"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    const user = useAuthStore.getState().user;
    router.replace(user ? "/dashboard" : "/login");
  }, [hydrate, router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
      Cargando...
    </div>
  );
}

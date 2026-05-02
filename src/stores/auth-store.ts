"use client";

import { create } from "zustand";
import { tokenStorage } from "@/lib/storage";
import type { AuthUser } from "@/types/api";

interface AuthState {
  user: AuthUser | null;
  isReady: boolean;
  hydrate: () => void;
  setUser: (user: AuthUser | null) => void;
  hasPermission: (code: string) => boolean;
  hasModule: (code: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isReady: false,
  hydrate: () => {
    const user = tokenStorage.getUser<AuthUser>();
    set({ user, isReady: true });
  },
  setUser: (user) => {
    if (user) tokenStorage.setUser(user);
    set({ user });
  },
  hasPermission: (code: string) => {
    const u = get().user;
    return !!u?.permissions?.includes(code);
  },
  hasModule: (code: string) => {
    const u = get().user;
    return !!u?.modules?.some((m) => m.code === code);
  },
  logout: () => {
    tokenStorage.clear();
    set({ user: null });
    if (typeof window !== "undefined") window.location.href = "/login";
  },
}));

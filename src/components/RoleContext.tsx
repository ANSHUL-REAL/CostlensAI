"use client";

import * as React from "react";
import type { Role } from "@/lib/types";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  finance_manager: "Finance Manager",
  project_manager: "Project Manager",
  leadership_viewer: "Leadership Viewer",
};

/** Roles allowed to see exact individual hourly rates / cost contributions. */
export function canSeeExactRates(role: Role) {
  return role === "admin" || role === "finance_manager";
}

type RoleContextValue = {
  role: Role;
  setRole: (r: Role) => void;
};

const RoleContext = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = React.useState<Role>("admin");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("costlens-role") as Role | null;
    if (stored) setRoleState(stored);
  }, []);

  const setRole = React.useCallback((r: Role) => {
    setRoleState(r);
    window.localStorage.setItem("costlens-role", r);
  }, []);

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = React.useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

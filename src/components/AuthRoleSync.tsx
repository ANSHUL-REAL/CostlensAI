"use client";

import * as React from "react";
import type { Role } from "@/lib/types";
import { useRole } from "./RoleContext";

export function AuthRoleSync({ role }: { role: Role }) {
  const { role: currentRole, setRole } = useRole();

  React.useEffect(() => {
    if (currentRole !== role) {
      setRole(role);
    }
  }, [currentRole, role, setRole]);

  return null;
}

import { redirect } from "next/navigation";
import type { Role } from "./types";
import { createClient, createServiceRoleClient } from "./supabase/server";

const DEMO_ROLE_BY_EMAIL: Record<string, Role> = {
  "admin@acme.com": "admin",
  "finance@acme.com": "finance_manager",
  "pm@acme.com": "project_manager",
  "leadership@acme.com": "leadership_viewer",
};

type SessionContext = {
  userId: string;
  email: string;
  role: Role;
  name: string;
};

type AuthClaims = {
  sub?: string;
  email?: string;
};

function getBootstrapRole(email: string): Role {
  return DEMO_ROLE_BY_EMAIL[email] ?? "leadership_viewer";
}

async function getVerifiedClaims() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return null;
  }

  const { sub, email } = data.claims as AuthClaims;

  if (!sub || !email) {
    return null;
  }

  return { sub, email };
}

async function ensureUserProfile(userId: string, email: string) {
  const service = createServiceRoleClient();
  const {
    data: existing,
    error: existingError,
  } = await service.from("users").select("id, name, email, role").eq("id", userId).maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing as { id: string; name: string; email: string; role: Role };
  }

  const fallbackName = email.split("@")[0].replace(/[._-]+/g, " ").trim();
  const seededRole = getBootstrapRole(email);
  const name =
    fallbackName.length > 0
      ? fallbackName.replace(/\b\w/g, (char) => char.toUpperCase())
      : "CostLens User";

  const {
    data: created,
    error: createError,
  } = await service
    .from("users")
    .upsert(
      {
        id: userId,
        email,
        name,
        role: seededRole,
      },
      { onConflict: "id" },
    )
    .select("id, name, email, role")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created as { id: string; name: string; email: string; role: Role };
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const claims = await getVerifiedClaims();

  if (!claims) {
    return null;
  }

  const profile = await ensureUserProfile(claims.sub, claims.email);

  return {
    userId: profile.id,
    email: profile.email,
    role: profile.role,
    name: profile.name,
  };
}

export async function requireSession() {
  const session = await getSessionContext();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await requireSession();

  if (!allowedRoles.includes(session.role)) {
    redirect("/dashboard");
  }

  return session;
}

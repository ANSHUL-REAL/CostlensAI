import { requireSession } from "@/lib/auth";
import { AuthRoleSync } from "@/components/AuthRoleSync";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen bg-canvas">
      <AuthRoleSync role={session.role} />
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

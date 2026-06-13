"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ScanLine, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEMO_ACCOUNTS = [
  {
    email: "admin@acme.com",
    password: "demo1234",
    label: "Admin",
    hint: "Full access · exact rates visible",
  },
  {
    email: "finance@acme.com",
    password: "demo1234",
    label: "Finance Manager",
    hint: "Reports · budget view",
  },
  {
    email: "pm@acme.com",
    password: "demo1234",
    label: "Project Manager",
    hint: "Project-level oversight",
  },
  {
    email: "leadership@acme.com",
    password: "demo1234",
    label: "Leadership Viewer",
    hint: "Aggregated costs only",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const supabaseRef = React.useRef<ReturnType<typeof createClient> | null>(null);
  const [email, setEmail] = React.useState("admin@acme.com");
  const [password, setPassword] = React.useState("demo1234");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  React.useEffect(() => {
    let active = true;

    async function checkSession() {
      const supabase = getSupabase();
      const { data, error: sessionError } = await supabase.auth.getUser();

      if (!active || sessionError) {
        return;
      }

      if (data.user) {
        router.replace("/dashboard");
      }
    }

    void checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  async function signIn(emailVal: string, passwordVal: string) {
    setError(null);
    setLoading(true);

    const supabase = getSupabase();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailVal,
      password: passwordVal,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await signIn(email, password);
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-black-primary">
      {/* Immersive minimalist background with zero decorative gradients or shadows */}
      <div className="relative hidden flex-col justify-between px-16 py-14 lg:flex lg:w-[54%]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-grey-border/40 bg-white/[0.04]">
            <ScanLine className="h-4 w-4 text-accent-lime" strokeWidth={2.25} />
          </div>
          <span className="text-sm font-semibold tracking-wide text-white-primary">CostLens AI</span>
        </div>

        <div className="relative max-w-lg">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-accent-lime/10 px-3 py-1 text-xs font-semibold text-accent-lime border border-accent-lime/20">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered cost attribution
          </div>
          <h1 className="font-display text-[3.2rem] font-medium leading-[1.05] tracking-[-0.04em] text-white-primary">
            See where your
            <br />
            people-cost
            <br />
            actually goes.
          </h1>
          <p className="mt-5 max-w-md text-sm text-white-primary/70 leading-relaxed">
            CostLens AI converts calendar meetings into project-level HR expenditure
            - no timesheets, no guesswork.
          </p>

          <div className="mt-12 space-y-6">
            <Feature
              icon={<Sparkles className="h-4 w-4 text-accent-lime" />}
              title="AI project attribution"
              body="Every meeting is mapped to a project with confidence score and reason."
            />
            <Feature
              icon={<TrendingDown className="h-4 w-4 text-accent-lime" />}
              title="Hidden cost leakage detection"
              body="Surface low-priority work quietly consuming expensive employee hours."
            />
            <Feature
              icon={<ShieldCheck className="h-4 w-4 text-accent-lime" />}
              title="Privacy-safe by design"
              body="Individual salary detail is visible only to Admin and Finance."
            />
          </div>
        </div>

        <div className="relative text-xs text-white-primary/45">© 2026 CostLens AI · AI Hackathon</div>
      </div>

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[46%] lg:px-16 bg-black-primary">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-grey-border/40 bg-white/[0.04]">
              <ScanLine className="h-4 w-4 text-accent-lime" strokeWidth={2.25} />
            </div>
            <span className="text-sm font-semibold tracking-wide text-white-primary">CostLens AI</span>
          </div>

          <div className="glass-card rounded-[4px] p-8 border border-grey-border/40 bg-dark-surface/90">
            <h2 className="text-2xl font-semibold tracking-tight text-white-primary">Sign in</h2>
            <p className="mt-1 text-sm text-white-primary/60">
              Click a demo account below to log in instantly.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white-primary/60">Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  required
                  className="glass-input h-10 w-full rounded-[4px] px-3 text-sm text-white-primary focus:border-accent-lime focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white-primary/60">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="glass-input h-10 w-full rounded-[4px] px-3 text-sm text-white-primary focus:border-accent-lime focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-accent-lime px-4 text-xs font-bold text-black-primary transition-all hover:opacity-90 disabled:opacity-50"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              {error ? (
                <p className="rounded-[4px] border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 leading-relaxed">
                  {error}
                </p>
              ) : null}
            </form>

            <div className="mt-8">
              <div className="mb-4 flex items-center gap-3 text-xs text-white-primary/45">
                <div className="h-px flex-1 bg-grey-border/20" />
                <span className="font-semibold uppercase tracking-wider">Demo Quick Access</span>
                <div className="h-px flex-1 bg-grey-border/20" />
              </div>
              <div className="space-y-2.5">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setEmail(account.email);
                      setPassword(account.password);
                      void signIn(account.email, account.password);
                    }}
                    className={[
                      "w-full rounded-full px-4 py-2.5 text-left text-xs transition-all border",
                      email === account.email
                        ? "bg-accent-lime/10 text-white-primary border-accent-lime/40"
                        : "bg-white/[0.02] text-white-primary/70 border-grey-border/20 hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white-primary">{account.label}</span>
                      <span className="text-[10px] text-white-primary/50">{account.email}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-white-primary/40">{account.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border border-grey-border/20 bg-white/[0.02]">
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-white-primary">{title}</div>
        <div className="mt-1 text-xs text-white-primary/60 leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

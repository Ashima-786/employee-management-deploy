import { useEffect, useState } from "react";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BrainCircuit, Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: typeof search["next"] === "string" ? search["next"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Enterprise AI Workspace" },
      { name: "description", content: "Sign in to the Proactive Work Intelligence workspace." },
      { property: "og:title", content: "Sign in · Enterprise AI Workspace" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function sanitizeNext(next?: string) {
  if (!next) return "/";
  try {
    const url = new URL(next, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search : "/";
  } catch {
    return "/";
  }
}

type Mode = "signin" | "signup";

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [team, setTeam] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  // Bracket notation to satisfy TypeScript TS4111
  const env = import.meta.env as Record<string, any>;
  const API_URL = env["VITE_API_URL"] || "http://localhost:5000/api";

  // A visitor with an active session should not see the sign-in card.
  useEffect(() => {
    let active = true;
    const localUser = localStorage.getItem("enterprise_auth_user");
    if (localUser) {
      setSignedIn(true);
      return;
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (active && user) setSignedIn(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        const cleanName = displayName.trim() || cleanEmail.split("@")[0] || "User";
        const cleanRole = role.trim() || "Product Manager";
        const cleanTeam = team.trim() || "Product";

        // 1. Sync new user profile to MongoDB Atlas
        try {
          await fetch(`${API_URL}/employees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: cleanEmail.split("@")[0] + "_" + Date.now().toString().slice(-4),
              name: cleanName,
              email: cleanEmail,
              role: cleanRole,
              team: cleanTeam,
              initials: cleanName.substring(0, 2).toUpperCase(),
              color: "blue",
              activeTasks: 1,
              priorityTasks: 0,
              commitments: 1,
              meetings: 1,
              workload: "Balanced",
            }),
          });
        } catch (mongoErr) {
          console.warn("MongoDB user sync notice:", mongoErr);
        }

        // 2. Register user in Supabase Auth
        const { error: signUpError, data } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth",
            data: { display_name: cleanName, job_title: cleanRole, team: cleanTeam },
          },
        });
        if (signUpError && !signUpError.message.includes("already registered")) {
          throw signUpError;
        }

        // 3. Cache profile locally so the dashboard immediately displays their real name
        const userProfile = {
          id: data?.user?.id || cleanEmail,
          display_name: cleanName,
          job_title: cleanRole,
          team: cleanTeam,
          email: cleanEmail,
        };
        localStorage.setItem("enterprise_auth_user", JSON.stringify(userProfile));
        localStorage.setItem(`user_profile_${cleanEmail}`, JSON.stringify(userProfile));

        setSignedIn(true);
        await navigate({ to: sanitizeNext(next), replace: true });
      } else {
        const { error: signInError, data } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        const cachedProfileStr = localStorage.getItem(`user_profile_${cleanEmail}`);
        const cachedProfile = cachedProfileStr ? JSON.parse(cachedProfileStr) : null;

        if (signInError && !cachedProfile) {
          throw signInError;
        }

        const meta = (data?.user?.user_metadata || {}) as Record<string, any>;
        const activeUser = {
          id: data?.user?.id || cleanEmail,
          display_name:
            cachedProfile?.display_name ||
            meta["display_name"] ||
            cleanEmail.split("@")[0] ||
            "User",
          job_title: cachedProfile?.job_title || meta["job_title"] || "Workspace Member",
          team: cachedProfile?.team || meta["team"] || "Enterprise",
          email: cleanEmail,
        };

        localStorage.setItem("enterprise_auth_user", JSON.stringify(activeUser));
        setSignedIn(true);
        await navigate({ to: sanitizeNext(next), replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (signedIn) {
    return <Navigate to={sanitizeNext(next)} replace />;
  }

  const isSignup = mode === "signup";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-10 w-10 rounded-lg bg-sidebar text-sidebar-foreground flex items-center justify-center shadow-card">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold tracking-tight text-foreground">Proactive Work Intelligence</h1>
            <p className="text-xs text-muted-foreground">Enterprise AI Workspace</p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card shadow-card p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            {isSignup ? "Set up a workspace account with your work email." : "Sign in to view your work intelligence."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="displayName">Full name</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required autoComplete="name" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="team">Team (optional)</Label>
                  <Input id="team" value={team} onChange={(e) => setTeam(e.target.value)} autoComplete="organization" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="role">Role (optional)</Label>
                  <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} autoComplete="organization-title" placeholder="e.g. Product Manager" />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@company.com" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignup && (
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={async () => {
                      setError(null);
                      setNotice(null);
                      if (!email) {
                        setError("Enter your email first, then we can send a reset link.");
                        return;
                      }
                      setBusy(true);
                      try {
                        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                          redirectTo: window.location.origin + "/reset-password",
                        });
                        if (resetError) throw resetError;
                        setNotice("Password reset link sent — check your inbox.");
                      } catch (err) {
                        setError(err instanceof Error ? err.message : "Could not send the reset email.");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={isSignup ? "new-password" : "current-password"} />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {notice && (
              <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignup ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-5">
            {isSignup ? "Already have an account?" : "New to the workspace?"}{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => {
                setMode(isSignup ? "signin" : "signup");
                setError(null);
                setNotice(null);
              }}
            >
              {isSignup ? "Sign in" : "Create an account"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">Enterprise AI Workspace · Proactive Work Intelligence</p>
      </div>
    </div>
  );
}
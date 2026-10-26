import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password · Enterprise AI Workspace" },
      { name: "description", content: "Choose a new password for your workspace account." },
      { property: "og:title", content: "Set a new password · Enterprise AI Workspace" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const isRecovery = typeof window !== "undefined" && window.location.hash.includes("type=recovery");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      await navigate({ to: "/auth", search: { next: undefined }, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the password.");
    } finally {
      setBusy(false);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card shadow-card p-6 text-center">
          <KeyRound className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h1 className="font-display text-lg font-semibold text-foreground">Reset link not found</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Open the password-reset link from your email inbox, or <a href="/auth" className="text-primary hover:underline">start from sign in</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card shadow-card p-6">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">Set a new password</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-5">Choose a password with at least 8 characters.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={busy || done}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {done ? "Password updated" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}

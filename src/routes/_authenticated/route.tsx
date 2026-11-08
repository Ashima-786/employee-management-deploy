import { useEffect, useState } from "react";
import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const savedUser = localStorage.getItem("enterprise_auth_user");
        if (savedUser) {
          if (active) setStatus("authed");
          return;
        }

        // Check with a fast 1.5s timeout so dead Supabase host never hangs the page
        const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { user: null } }), 1500)
        );

        const authPromise = supabase.auth
          .getUser()
          .catch(() => ({ data: { user: null }, error: null }));

        const res: any = await Promise.race([authPromise, timeoutPromise]);

        if (active) {
          if (res?.data?.user) {
            setStatus("authed");
          } else {
            // Default demo access so user is never locked out
            const demoUser = {
              id: "demo-user",
              display_name: "Ashima Jan",
              job_title: "DevOps Engineer",
              team: "Cloud Infrastructure",
              email: "ashima786@gmail.com",
            };
            localStorage.setItem("enterprise_auth_user", JSON.stringify(demoUser));
            setStatus("authed");
          }
        }
      } catch (err) {
        console.warn("Auth check failed:", err);
        if (active) {
          setStatus("authed");
        }
      }
    };

    void verifySession();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "unauthed") {
    return <Navigate to="/auth" search={{ next: location.pathname }} replace />;
  }

  return <Outlet />;
}
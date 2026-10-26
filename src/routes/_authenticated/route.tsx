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
      const savedUser = localStorage.getItem("enterprise_auth_user");
      if (savedUser) {
        if (active) setStatus("authed");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (active) {
        setStatus(user ? "authed" : "unauthed");
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
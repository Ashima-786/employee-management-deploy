import type { ProfileRow } from "@/lib/profile-types";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SignedInProfile extends ProfileRow {
  email: string;
}

/**
 * Loads the signed-in user's profile from MongoDB/local session and Supabase.
 * `refresh` re-reads the profile after the user edits their details.
 */
export function useProfile() {
  const [profile, setProfile] = useState<SignedInProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    let active = true;

    const load = async () => {
      // 1. Read cached MongoDB / Local Auth profile if present
      let localProfile: Record<string, any> | null = null;
      const savedUser = localStorage.getItem("enterprise_auth_user");
      if (savedUser) {
        try {
          localProfile = JSON.parse(savedUser);
        } catch (e) {
          console.error("Failed to parse stored user", e);
        }
      }

      // 2. Check Supabase Auth session
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // If no Supabase session exists, fall back to the MongoDB/local session if signed in
      if (!user) {
        if (active) {
          if (localProfile) {
            setProfile({
              id: localProfile["id"] || localProfile["_id"] || "user",
              display_name:
                localProfile["display_name"] ||
                localProfile["name"] ||
                localProfile["email"]?.split("@")[0] ||
                "User",
              job_title: localProfile["job_title"] || localProfile["role"] || "",
              team: localProfile["team"] || "",
              email: localProfile["email"] || "",
            });
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
        return;
      }

      // 3. Query Supabase profiles table
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, job_title, team")
        .eq("id", user.id)
        .maybeSingle();

      // Bracket notation to satisfy TypeScript TS4111
      const meta = (user.user_metadata || {}) as Record<string, any>;

      if (active) {
        const resolvedProfile: SignedInProfile = {
          id: user.id,
          display_name:
            data?.display_name ||
            localProfile?.["display_name"] ||
            meta["display_name"] ||
            meta["full_name"] ||
            user.email?.split("@")[0] ||
            "User",
          job_title:
            data?.job_title ||
            localProfile?.["job_title"] ||
            meta["job_title"] ||
            "",
          team:
            data?.team ||
            localProfile?.["team"] ||
            meta["team"] ||
            "",
          email: user.email ?? localProfile?.["email"] ?? "",
        };

        // Keep local session cache in sync with any database updates
        localStorage.setItem("enterprise_auth_user", JSON.stringify(resolvedProfile));
        setProfile(resolvedProfile);
        setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [tick]);

  return { profile, loading, refresh };
}
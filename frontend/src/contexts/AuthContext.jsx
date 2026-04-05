import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getMe } from "../api/authApi";

const AuthContext = createContext(null);

const normalizeProfile = (profile) => {
  if (!profile) return null;

  const firstName = profile.first_name?.trim() || "";
  const lastName = profile.last_name?.trim() || "";
  const displayName = `${firstName} ${lastName}`.trim();

  return {
    ...profile,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName || profile.email || "",
  };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const me = await getMe();
      const normalized = normalizeProfile(me);
      setProfile(normalized);
      return normalized;
    } catch (error) {
      console.error("fetchProfile error:", error);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);

        if (session) {
          await fetchProfile();
        } else {
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      setSession(session);

      if (!session) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      await fetchProfile();

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signOut,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
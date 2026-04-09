import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { getMe } from "../api/authApi";

const AuthContext = createContext(null);

const normalizeProfile = (profile) => {
  if (!profile) return null;
  const firstName = profile.first_name?.trim() || "";
  const lastName  = profile.last_name?.trim()  || "";
  return {
    ...profile,
    first_name:   firstName,
    last_name:    lastName,
    display_name: `${firstName} ${lastName}`.trim() || profile.email || "",
  };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFetchingProfile     = useRef(false);

  const fetchProfile = async () => {
    if (isFetchingProfile.current) return;
    isFetchingProfile.current = true;
    try {
      const me = await getMe();
      setProfile(normalizeProfile(me));
    } catch (err) {
      // ✅ 403 pending — ne pas vider le profil si déjà chargé
      if (err?.response?.status === 403) {
        console.warn("[AuthContext] 403 — compte pending ou rejeté");
      } else {
        setProfile(null);
      }
    } finally {
      isFetchingProfile.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      // ✅ Token recovery dans le hash → redirection
      if (window.location.hash.includes("type=recovery")) {
        window.location.href = "/reset-password" + window.location.hash;
        return;
      }

      setSession(session ?? null);
      if (session) await fetchProfile();
      if (mounted) setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "INITIAL_SESSION") return;

      // ✅ Redirection reset password
      if (event === "PASSWORD_RECOVERY") {
        window.location.href = "/reset-password";
        return;
      }

      setSession(session ?? null);

      if (event === "SIGNED_OUT") {
        setProfile(null);
        setLoading(false);
        return;
      }

      // ✅ Ne recharge le profil que si pas déjà chargé
      if (event === "SIGNED_IN" && session) {
        if (!profile) {
          Promise.resolve().then(() => { if (mounted) fetchProfile(); });
        }
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
    <AuthContext.Provider value={{
      session,
      user:           session?.user ?? null,
      profile,
      loading,
      signOut,
      refreshProfile: fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
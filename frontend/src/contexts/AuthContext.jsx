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
      if (err?.response?.status === 403) {
        // ✅ 403 — ne pas vider le profil, ne pas boucler
        console.warn("[AuthContext] 403 — accès refusé");
      } else {
        setProfile(null);
      }
    } finally {
      isFetchingProfile.current = false;
      setLoading(false); // ✅ Toujours stopper le loading
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (window.location.hash.includes("type=recovery")) {
        window.location.href = "/reset-password" + window.location.hash;
        return;
      }

      setSession(session ?? null);
      if (session) {
        await fetchProfile();
      } else {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "INITIAL_SESSION") return;

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

      // ✅ Ne recharge que si pas de profil ET pas déjà en cours
      if (event === "SIGNED_IN" && session && !isFetchingProfile.current) {
        Promise.resolve().then(() => { if (mounted) fetchProfile(); });
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
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { getMe } from "../api/authApi";

const AuthContext = createContext(null);

const normalizeProfile = (profile) => {
  if (!profile) return null;
  const firstName = profile.first_name?.trim() || "";
  const lastName = profile.last_name?.trim() || "";
  return {
    ...profile,
    first_name: firstName,
    last_name: lastName,
    display_name: `${firstName} ${lastName}`.trim() || profile.email || "",
  };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(undefined); // undefined = pas encore initialisé
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isFetchingProfile = useRef(false);

  const fetchProfile = async () => {
    if (isFetchingProfile.current) return;
    isFetchingProfile.current = true;
    try {
      const me = await getMe();
      setProfile(normalizeProfile(me));
    } catch {
      setProfile(null);
    } finally {
      isFetchingProfile.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session ?? null);
      if (session) await fetchProfile();
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        // Ignore INITIAL_SESSION : déjà géré par getSession() ci-dessus
        if (event === "INITIAL_SESSION") return;

        setSession(session ?? null);

        if (event === "SIGNED_OUT") {
          setProfile(null);
          return;
        }

        if (event === "SIGNED_IN" && session) {
          await fetchProfile();
        }
      }
    );

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
      user: session?.user ?? null,
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
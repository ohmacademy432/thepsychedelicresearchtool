import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured, type Profile } from "./supabase";

export interface SignupInput {
  email: string;
  password: string;
  full_name: string;
  professional_role: string;
  credentials: string;
  organization: string;
  access_request_note: string;
}

interface AuthContextValue {
  configured: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (
    input: SignupInput,
  ) => Promise<
    | { ok: true; emailConfirmationRequired: boolean }
    | { ok: false; error: string }
  >;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch profile:", error.message);
        setProfile(null);
        return;
      }
      setProfile((data as Profile | null) ?? null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  }, [session, fetchProfile]);

  // Initial session load + listen for auth state changes.
  // We set loading=false AS SOON AS getSession returns — we do not wait for
  // the profile fetch. The profile fetch runs in the background and updates
  // state when it completes. This prevents a hung or slow Supabase profile
  // query from freezing the entire app on the LoadingScreen.
  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Safety net: if getSession somehow never resolves (rare Supabase
    // client hiccup), force loading=false after 8 seconds so the app
    // renders the AuthScreen instead of hanging forever.
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        console.warn("Auth: getSession did not resolve within 8s; continuing.");
        setLoading(false);
      }
    }, 8000);

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      clearTimeout(safetyTimer);
      setSession(data.session);
      setLoading(false); // Unblock the UI immediately.
      // Fire-and-forget the profile fetch; UI will re-render when it lands.
      if (data.session?.user) {
        void fetchProfile(data.session.user.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          // Background fetch; don't await, don't block.
          void fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      },
    );

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = useCallback(
    async (
      input: SignupInput,
    ): Promise<
      | { ok: true; emailConfirmationRequired: boolean }
      | { ok: false; error: string }
    > => {
      if (!supabaseConfigured) {
        return { ok: false, error: "Supabase is not configured." };
      }

      // Pass profile fields via options.data so the database trigger
      // (`on_auth_user_created` -> `handle_new_user`) can create the
      // profiles row server-side using service_role. This works whether
      // or not Supabase is configured to require email confirmation,
      // because the trigger fires on auth.users INSERT regardless of
      // session/JWT state.
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.full_name.trim(),
            professional_role: input.professional_role.trim(),
            credentials: input.credentials.trim(),
            organization: input.organization.trim(),
            access_request_note: input.access_request_note.trim(),
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      if (!data.user?.id) {
        return {
          ok: false,
          error: "Signup did not return a user. Please try again.",
        };
      }

      // When Supabase is configured to require email confirmation, signUp
      // does NOT return a session — the user must verify their email and
      // then sign in. When email confirmation is OFF, signUp DOES return
      // a session and the user is signed in immediately. The UI uses this
      // flag to show the right success message.
      const emailConfirmationRequired = !data.session;

      return { ok: true, emailConfirmationRequired };
    },
    [],
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      if (!supabaseConfigured) {
        return { ok: false, error: "Supabase is not configured." };
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: supabaseConfigured,
      session,
      user: session?.user ?? null,
      profile,
      loading,
      profileLoading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [
      session,
      profile,
      loading,
      profileLoading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

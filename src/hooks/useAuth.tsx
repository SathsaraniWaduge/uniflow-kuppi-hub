import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  User,
  mockSignIn,
  mockSignUp,
  mockSignOut,
  getAuthUser,
} from "@/mocks/data";

type Profile = {
  id: string;
  name: string;
  role: "student" | "organizer";
  current_year: number | null;
  current_semester: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

interface AuthContextType {
  user: { id: string; email: string } | null;
  session: any;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: "student" | "organizer") => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function userToProfile(u: User): Profile {
  return {
    id: u.id,
    name: u.name,
    role: u.role,
    current_year: u.current_year,
    current_semester: u.current_semester,
    avatar_url: u.avatar_url,
    created_at: u.created_at,
    updated_at: u.updated_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getAuthUser();
    if (stored) {
      setUser({ id: stored.id, email: stored.email });
      setProfile(userToProfile(stored));
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string, role: "student" | "organizer") => {
    const newUser = mockSignUp(email, password, name, role);
    setUser({ id: newUser.id, email: newUser.email });
    setProfile(userToProfile(newUser));
  };

  const signIn = async (email: string, password: string) => {
    const found = mockSignIn(email, password);
    setUser({ id: found.id, email: found.email });
    setProfile(userToProfile(found));
  };

  const signOut = async () => {
    mockSignOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session: user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  clearToken,
  getToken,
  getUserFromToken,
  setToken,
  type SessionUser,
} from "@/lib/session";

type AuthContextValue = {
  token: string | null;
  user: SessionUser | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();

    if (storedToken) {
      setTokenState(storedToken);
      setUser(getUserFromToken(storedToken));
    }

    setIsLoading(false);
  }, []);

  function signIn(newToken: string) {
    setToken(newToken);
    setTokenState(newToken);
    setUser(getUserFromToken(newToken));
  }

  function signOut() {
    clearToken();
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

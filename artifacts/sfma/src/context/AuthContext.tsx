import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface Member {
  id: string;
  username: string;
  grade: string;
  gradeEmoji: string;
  memberId: string;
  country?: string | null;
  whatsapp?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  reputation: number;
  joinedAt: string;
  isBanned: boolean;
  badges: string[];
}

interface AuthContextType {
  user: Member | null;
  token: string | null;
  login: (member: Member, token: string) => void;
  logout: () => void;
  isLord: boolean;
  isFounder: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LORD_GRADES = ["Fondateur_Suprême", "Co-Fondateur", "Lord", "Administrateur"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Member | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedToken = localStorage.getItem("sfma_token");
    const storedUser = localStorage.getItem("sfma_user");
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("sfma_token");
        localStorage.removeItem("sfma_user");
      }
    }
  }, []);

  const login = (member: Member, newToken: string) => {
    setUser(member);
    setToken(newToken);
    localStorage.setItem("sfma_token", newToken);
    localStorage.setItem("sfma_user", JSON.stringify(member));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sfma_token");
    localStorage.removeItem("sfma_user");
    queryClient.clear();
  };

  const isLord = user ? LORD_GRADES.includes(user.grade) : false;
  const isFounder = user?.grade === "Fondateur_Suprême";

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLord, isFounder }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

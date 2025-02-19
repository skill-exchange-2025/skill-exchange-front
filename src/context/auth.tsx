import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  skills: Array<{
    name: string;
    proficiencyLevel: string;
    description?: string;
  }>;
  desiredSkills: Array<{
    name: string;
    desiredProficiencyLevel: string;
    description?: string;
  }>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    phone: string,
    email: string,
    password: string,
    skills: Array<{
      name: string;
      proficiencyLevel: string;
      description?: string;
    }>,
    desiredSkills: Array<{
      name: string;
      desiredProficiencyLevel: string;
      description?: string;
    }>,
    referralSource?: string,
    friendEmail?: string
  ) => Promise<void>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  updatePassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/profile")
        .then((response) => setUser(response.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", response.data.access_token);
    sessionStorage.setItem("token", response.data.access_token);
    sessionStorage.setItem("refresh_token", response.data.refresh_token);
    sessionStorage.setItem("user", JSON.stringify(response.data.user));

    setUser(response.data.user);
  };

  const signUp = async (
    name: string,
    phone: string,
    email: string,
    password: string,
    skills: Array<{
      name: string;
      proficiencyLevel: string;
      description?: string;
    }>,
    desiredSkills: Array<{
      name: string;
      desiredProficiencyLevel: string;
      description?: string;
    }>,
    referralSource?: string,
    friendEmail?: string
  ) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        phone,
        email,
        password,
        skills,
        desiredSkills,
        referralSource,
        friendEmail,
      });

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);
        setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const response = await api.post("/auth/reset-password", { email });
    return response.data;
  };

  const verifyOTP = async (email: string, otp: string) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data.valid;
  };

  const updatePassword = async (email: string, newPassword: string) => {
    const response = await api.post("/auth/update-password", {
      email,
      newPassword,
    });
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        verifyOTP,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

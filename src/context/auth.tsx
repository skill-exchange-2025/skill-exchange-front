import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  verifyOTP: (
    email: string,
    otp: string
  ) => Promise<{
    success: boolean;
    isValid?: boolean;
    error?: string;
  }>;
  updatePassword: (email: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    localStorage.setItem("user", JSON.stringify(response.data.user));

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
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          const conflictField = error.response.data?.field;
          if (conflictField === "email") {
            throw new Error("This email is already registered");
          } else if (conflictField === "phone") {
            throw new Error("This phone number is already registered");
          } else {
            throw new Error("This email or phone number is already registered");
          }
        }
        throw new Error(error.response?.data?.message || "Registration failed");
      }
      throw new Error("An unexpected error occurred during registration");
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("refresh_token");
    localStorage.removeItem("persist:auth");
    localStorage.removeItem("persist:root");
    setUser(null);
    navigate("/signin");
  };

  const resetPassword = async (email: string) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          email,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || "Failed to send reset password email"
        );
      }
      throw new Error("An unexpected error occurred");
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      return {
        success: true,
        isValid: response.data.valid,
      };
    } catch (error) {
      console.error("OTP verification error:", error);
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.message || "Failed to verify OTP",
        };
      }
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
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

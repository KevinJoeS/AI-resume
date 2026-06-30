import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMe } from "../api/resumeApi";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true); // checking persisted session

  // On mount, rehydrate session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const guest = localStorage.getItem("guest_mode");

    if (guest === "true") {
      setIsGuest(true);
      setLoading(false);
      return;
    }

    if (token) {
      getMe()
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          // Token expired or invalid — clear storage
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    localStorage.removeItem("guest_mode");
    setUser(data.user);
    setIsGuest(false);
    return data;
  };

  const register = async (fullName, email, password) => {
    const data = await registerUser(fullName, email, password);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    localStorage.removeItem("guest_mode");
    setUser(data.user);
    setIsGuest(false);
    return data;
  };

  const continueAsGuest = () => {
    localStorage.setItem("guest_mode", "true");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setIsGuest(true);
    setUser(null);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("guest_mode");
    setUser(null);
    setIsGuest(false);
  };

  const isAuthenticated = !!user || isGuest;

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, isAuthenticated, login, register, continueAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import api from "../config/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("s2d_token") || null);
  const [loading, setLoading] = useState(true);

  // On mount, validate stored token
  useEffect(() => {
    if (token) {
      api
        .get(`/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post(`/auth/login`, {
      username,
      password,
    });
    const data = res.data;
    setToken(data.token);
    setUser({
      username: data.username,
      role: data.role,
      userId: data.userId,
      restaurantId: data.restaurantId,
    });
    localStorage.setItem("s2d_token", data.token);
    return data;
  };

  const register = async (username, password) => {
    const res = await api.post(`/auth/register`, {
      username,
      password,
      role: "CUSTOMER",
    });
    const data = res.data;
    setToken(data.token);
    setUser({
      username: data.username,
      role: data.role,
      userId: data.userId,
      restaurantId: data.restaurantId,
    });
    localStorage.setItem("s2d_token", data.token);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("s2d_token");
  };

  const isAuthenticated = !!token && !!user;

  const hasRole = (role) => user?.role === role;

  // Axios interceptor for adding token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, isAuthenticated, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

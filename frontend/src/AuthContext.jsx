import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AUTH_STORAGE_KEY = "akexpenses_auth";
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.user) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }, []);

  const persistAuth = (authData) => {
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  };

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Login failed. Backend returned status ${response.status}`,
        );
      }

      persistAuth({ token: data.token, user: data.user });
      setSuccessMessage("Login successful! Redirecting...");
      return true;
    } catch (error) {
      const message =
        error.message === "Failed to fetch"
          ? `Backend not reachable. Verify that the backend is running at ${BASE_URL}`
          : error.message || "Unable to login";
      setAuthError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, confirmPassword) => {
    setLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Registration failed. Backend returned status ${response.status}`,
        );
      }

      persistAuth({ token: data.token, user: data.user });
      setSuccessMessage("Account created successfully! Redirecting...");
      return true;
    } catch (error) {
      const message =
        error.message === "Failed to fetch"
          ? `Backend not reachable. Verify that the backend is running at ${BASE_URL}`
          : error.message || "Unable to register";
      setAuthError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    setSuccessMessage(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      register,
      logout,
      loading,
      authError,
      successMessage,
      setAuthError,
      setSuccessMessage,
      isAuthenticated: Boolean(user && token),
    }),
    [user, token, loading, authError, successMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

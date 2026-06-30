import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(null);
const AUTH_KEY = "seapedia_auth";
// Session lifetime (Level 7): token/session expires after 7 days.
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function readAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
}
function writeAuth(value) {
  if (value) localStorage.setItem(AUTH_KEY, JSON.stringify(value));
  else localStorage.removeItem(AUTH_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeRole, setActiveRoleState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount.
  useEffect(() => {
    const saved = readAuth();
    if (!saved?.token || !saved?.userId) {
      setLoading(false);
      return;
    }
    // Expire stale sessions.
    if (saved.expiresAt && Date.now() > saved.expiresAt) {
      writeAuth(null);
      setLoading(false);
      return;
    }
    // Validate token with the server; active_role is read from the JWT.
    authApi
      .me()
      .then(({ user: u, activeRole: ar }) => {
        setUser(u);
        setToken(saved.token);
        setActiveRoleState(ar || saved.activeRole || null);
      })
      .catch(() => {
        writeAuth(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((u, tk, role) => {
    if (u && tk) {
      // Preserve existing expiry across role switches; create one on login.
      const prev = readAuth();
      const expiresAt =
        prev && prev.userId === u.id && prev.expiresAt
          ? prev.expiresAt
          : Date.now() + SESSION_TTL_MS;
      writeAuth({ userId: u.id, token: tk, activeRole: role || null, expiresAt });
    } else writeAuth(null);
  }, []);

  const login = useCallback(
    async (credentials) => {
      // Backend decides active_role & need_role_selection (encoded in the JWT).
      const { token: tk, user: u, activeRole, needRoleSelection } = await authApi.login(credentials);
      const role = needRoleSelection ? null : activeRole;
      setUser(u);
      setToken(tk);
      setActiveRoleState(role);
      persist(u, tk, role);
      return { user: u, activeRole: role };
    },
    [persist]
  );

  const register = useCallback(async (payload) => {
    return authApi.register(payload);
  }, []);

  // Switching the active role requires a NEW token from the server
  // (authorization follows the active_role inside the JWT).
  const setActiveRole = useCallback(
    async (role) => {
      if (!user || !user.roles.includes(role)) return;
      const { token: tk, user: u, activeRole } = await authApi.selectRole(role);
      setUser(u || user);
      setToken(tk);
      setActiveRoleState(activeRole || role);
      persist(u || user, tk, activeRole || role);
    },
    [user, persist]
  );

  const logout = useCallback(async () => {
    await authApi.logout(); // revoke token server-side (denylist)
    setUser(null);
    setToken(null);
    setActiveRoleState(null);
    writeAuth(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const { user: fresh } = await authApi.me();
    setUser(fresh);
    return fresh;
  }, [user]);

  const value = {
    user,
    token,
    activeRole,
    loading,
    isAuthenticated: !!user,
    needsRoleSelection: !!user && !activeRole,
    login,
    register,
    logout,
    setActiveRole,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

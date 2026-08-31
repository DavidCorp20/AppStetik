import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Vercel does not load .env.example. Keep a production fallback so a missing
// REACT_APP_BACKEND_URL can never turn the API base into "undefined/api".
const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || 'https://appstetik.fastapicloud.dev').replace(/\/$/, '');
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const authAxios = axios.create();

const DEFAULT_PLAN_LIMITS = {
  max_productos: 10,
  max_estilos: 5,
  max_disenos: 5,
  max_clientes: 20,
  can_export: false,
  can_simulate: false,
  can_view_reports: false,
};

const PREMIUM_PLAN_LIMITS = {
  max_productos: 999,
  max_estilos: 999,
  max_disenos: 999,
  max_clientes: 999,
  can_export: true,
  can_simulate: true,
  can_view_reports: true,
};

const fallbackPlanLimits = (user) =>
  user?.plan === 'premium' ? PREMIUM_PLAN_LIMITS : DEFAULT_PLAN_LIMITS;

const fetchPlanLimitsSafely = async (accessToken, user) => {
  try {
    const response = await axios.get(`${API}/auth/plan-limits`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
  } catch (error) {
    // A newly registered account can legitimately be pending and the hardened
    // backend may return 403 for protected plan data. That must never make
    // registration/login fail after authentication already succeeded.
    if (error?.response?.status !== 403) {
      console.warn('Plan limits unavailable:', error);
    }
  }
  return fallbackPlanLimits(user);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nailcost_token'));
  const [loading, setLoading] = useState(true);
  const [planLimits, setPlanLimits] = useState(null);

  useEffect(() => {
    const interceptor = authAxios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('nailcost_token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => authAxios.interceptors.request.eject(interceptor);
  }, []);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('nailcost_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setUser(res.data);
      setToken(storedToken);
      const limits = await fetchPlanLimitsSafely(storedToken, res.data);
      setPlanLimits(limits);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('nailcost_token');
      setToken(null);
      setUser(null);
      setPlanLimits(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = res.data;

    localStorage.setItem('nailcost_token', access_token);
    setToken(access_token);
    setUser(userData);

    const limits = await fetchPlanLimitsSafely(access_token, userData);
    setPlanLimits(limits);

    return userData;
  };

  const register = async (userData) => {
    // Registration itself is the only required operation here. Do not chain a
    // protected plan-limits request as part of registration success.
    const res = await axios.post(`${API}/auth/register`, userData);
    const { access_token, user: newUser } = res.data;

    localStorage.setItem('nailcost_token', access_token);
    setToken(access_token);
    setUser(newUser);
    setPlanLimits(fallbackPlanLimits(newUser));

    // Refresh asynchronously when possible, without making registration fail.
    fetchPlanLimitsSafely(access_token, newUser).then(setPlanLimits);

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('nailcost_token');
    setToken(null);
    setUser(null);
    setPlanLimits(null);
  };

  const updateProfile = async (profileData) => {
    const res = await authAxios.put(`${API}/auth/profile`, null, {
      params: profileData
    });
    setUser(prev => ({ ...prev, ...res.data }));
    return res.data;
  };

  const refreshPlanLimits = async () => {
    if (!token) return;
    const limits = await fetchPlanLimitsSafely(token, user);
    setPlanLimits(limits);
  };

  const isPremium = user?.plan === 'premium';
  const isBusinessUser = user?.user_type === 'business';
  const isPersonalUser = user?.user_type === 'personal' || !user?.user_type;
  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    token,
    loading,
    planLimits,
    isPremium,
    isBusinessUser,
    isPersonalUser,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    refreshPlanLimits,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

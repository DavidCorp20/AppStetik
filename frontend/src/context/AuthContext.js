import React, { useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || 'https://appstetik.fastapicloud.dev').replace(/\/$/, '');
const API = `${BACKEND_URL}/api`;
const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const authAxios = axios.create();

const DEFAULT_PLAN_LIMITS = { max_productos: 10, max_estilos: 5, max_disenos: 5, max_clientes: 20, can_export: false, can_simulate: false, can_view_reports: false };
const PREMIUM_PLAN_LIMITS = { max_productos: 999, max_estilos: 999, max_disenos: 999, max_clientes: 999, can_export: true, can_simulate: true, can_view_reports: true };
const fallbackPlanLimits = (user) => user?.plan === 'premium' ? PREMIUM_PLAN_LIMITS : DEFAULT_PLAN_LIMITS;
const clearStoredSession = () => localStorage.removeItem('nailcost_token');

// Normalize known collection-shaped admin responses at the HTTP boundary.
// AdminPage historically assumes these properties are arrays and calls .filter()
// immediately after a successful response. A malformed/empty API payload must
// never be allowed to turn that assumption into a render-time crash.
const normalizeResponse = (response) => {
  const url = response?.config?.url || '';
  const data = response?.data;
  if (url.includes('/admin/subscriptions')) {
    const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    response.data = { ...source, subscriptions: Array.isArray(source.subscriptions) ? source.subscriptions : [], summary: source.summary && typeof source.summary === 'object' ? source.summary : {} };
  } else if (url.includes('/admin/invoices')) {
    const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    response.data = { ...source, invoices: Array.isArray(source.invoices) ? source.invoices : [], summary: source.summary && typeof source.summary === 'object' ? source.summary : {} };
  } else if (Array.isArray(data)) {
    response.data = data;
  }
  return response;
};

const fetchPlanLimitsSafely = async (accessToken, user) => {
  try {
    const response = await axios.get(`${API}/auth/plan-limits`, { headers: { Authorization: `Bearer ${accessToken}` } });
    return response.data && typeof response.data === 'object' ? response.data : fallbackPlanLimits(user);
  } catch (error) {
    if (error?.response?.status !== 403) console.warn('Plan limits unavailable:', error);
    return fallbackPlanLimits(user);
  }
};

const isInactiveAccount = (user) => {
  const status = user?.account_status;
  return status === 'pending' || status === 'suspended' || user?.is_disabled === true;
};

const inactiveAccountError = (user) => {
  const status = user?.account_status;
  const detail = status === 'suspended' ? 'Tu cuenta ha sido suspendida. Contacta al administrador.' : status === 'pending' ? 'Tu cuenta está pendiente de activación. Contacta al administrador para activarla.' : 'Tu cuenta ha sido deshabilitada. Contacta al administrador.';
  const error = new Error(detail);
  error.response = { data: { detail }, status: 403 };
  return error;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nailcost_token'));
  const [loading, setLoading] = useState(true);
  const [planLimits, setPlanLimits] = useState(null);

  useEffect(() => {
    const requestInterceptor = authAxios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem('nailcost_token');
      if (storedToken) config.headers.Authorization = `Bearer ${storedToken}`;
      return config;
    });
    const responseInterceptor = authAxios.interceptors.response.use(normalizeResponse, (error) => Promise.reject(error));
    return () => {
      authAxios.interceptors.request.eject(requestInterceptor);
      authAxios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem('nailcost_token');
    if (!storedToken) { setLoading(false); return; }
    try {
      const res = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${storedToken}` } });
      const currentUser = res.data;
      if (isInactiveAccount(currentUser)) {
        clearStoredSession(); setToken(null); setUser(null); setPlanLimits(null); return;
      }
      setUser(currentUser); setToken(storedToken);
      setPlanLimits(await fetchPlanLimitsSafely(storedToken, currentUser));
    } catch (err) {
      console.error('Auth check failed:', err);
      clearStoredSession(); setToken(null); setUser(null); setPlanLimits(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = res.data || {};
    if (!access_token || !userData) {
      clearStoredSession(); setToken(null); setUser(null); setPlanLimits(null);
      const error = new Error('Respuesta de autenticación inválida.');
      error.response = { data: { detail: 'Respuesta de autenticación inválida.' }, status: 500 };
      throw error;
    }
    if (isInactiveAccount(userData)) {
      clearStoredSession(); setToken(null); setUser(null); setPlanLimits(null);
      throw inactiveAccountError(userData);
    }
    localStorage.setItem('nailcost_token', access_token);
    setToken(access_token); setUser(userData);
    setPlanLimits(await fetchPlanLimitsSafely(access_token, userData));
    return userData;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API}/auth/register`, userData);
    return res.data?.user || res.data;
  };
  const logout = () => { clearStoredSession(); setToken(null); setUser(null); setPlanLimits(null); };
  const updateProfile = async (profileData) => { const res = await authAxios.put(`${API}/auth/profile`, null, { params: profileData }); setUser(prev => ({ ...prev, ...res.data })); return res.data; };
  const refreshPlanLimits = async () => {
    if (!token || !user) return;
    if (isInactiveAccount(user)) { clearStoredSession(); setToken(null); setUser(null); setPlanLimits(null); return; }
    setPlanLimits(await fetchPlanLimitsSafely(token, user));
  };

  const isPremium = user?.plan === 'premium';
  const isBusinessUser = user?.user_type === 'business';
  const isPersonalUser = user?.user_type === 'personal' || !user?.user_type;
  const isAdmin = user?.role === 'admin';
  const value = { user, token, loading, planLimits, isPremium, isBusinessUser, isPersonalUser, isAdmin, login, register, logout, updateProfile, refreshPlanLimits, isAuthenticated: !!token && !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

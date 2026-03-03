import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Create axios instance with auth interceptor
export const authAxios = axios.create();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nailcost_token'));
  const [loading, setLoading] = useState(true);
  const [planLimits, setPlanLimits] = useState(null);

  // Configure axios interceptor
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

    return () => {
      authAxios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Check auth on load
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
      
      // Fetch plan limits
      const limitsRes = await axios.get(`${API}/auth/plan-limits`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      setPlanLimits(limitsRes.data);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('nailcost_token');
      setToken(null);
      setUser(null);
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
    
    // Fetch plan limits
    const limitsRes = await axios.get(`${API}/auth/plan-limits`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setPlanLimits(limitsRes.data);
    
    return userData;
  };

  const register = async (userData) => {
    const res = await axios.post(`${API}/auth/register`, userData);
    const { access_token, user: newUser } = res.data;
    
    localStorage.setItem('nailcost_token', access_token);
    setToken(access_token);
    setUser(newUser);
    
    // Fetch plan limits
    const limitsRes = await axios.get(`${API}/auth/plan-limits`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setPlanLimits(limitsRes.data);
    
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
    try {
      const res = await authAxios.get(`${API}/auth/plan-limits`);
      setPlanLimits(res.data);
    } catch (err) {
      console.error('Error refreshing plan limits:', err);
    }
  };

  const isPremium = user?.plan === 'premium';

  const value = {
    user,
    token,
    loading,
    planLimits,
    isPremium,
    login,
    register,
    logout,
    updateProfile,
    refreshPlanLimits,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

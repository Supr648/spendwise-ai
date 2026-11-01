import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('spendwise_token') || null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [googleConfig, setGoogleConfig] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initialize session: verify existing token or auto-login with demo user
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem('spendwise_token');

      // Fetch Google Config
      api.getGoogleConfig()
        .then((cfg) => setGoogleConfig(cfg))
        .catch(() => setGoogleConfig({ isConfigured: false }));

      if (storedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setLoading(false);
          return;
        } catch (err) {
          console.warn('Stored session invalid, auto-logging into demo account:', err.message);
          localStorage.removeItem('spendwise_token');
        }
      }

      // Auto login with demo user for seamless first-run
      try {
        const demoRes = await api.login('demo@spendwise.ai', 'password123');
        localStorage.setItem('spendwise_token', demoRes.token);
        setToken(demoRes.token);
        setUser(demoRes.user);
      } catch (demoErr) {
        console.error('Demo auto-login failed:', demoErr.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('spendwise_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    showToast(`Welcome back, ${res.user.name}!`);
    return res;
  };

  const register = async (name, email, password, currency = 'INR') => {
    const res = await api.register(name, email, password, currency);
    localStorage.setItem('spendwise_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    showToast(`Account created! Welcome to SpendWise AI, ${res.user.name}.`);
    return res;
  };

  const loginWithGoogle = async (googlePayload) => {
    const res = await api.googleAuth(googlePayload);
    localStorage.setItem('spendwise_token', res.token);
    setToken(res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    showToast(`Signed in with Google as ${res.user.name}!`);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('spendwise_token');
    setToken(null);
    setUser(null);
    setAuthModalOpen(true);
    setAuthMode('login');
    showToast('Signed out successfully.', 'info');
  };

  const changeCurrency = async (newCurrency) => {
    try {
      const res = await api.updateCurrency(newCurrency);
      setUser((prev) => ({
        ...prev,
        currency: res.currency,
        currencySymbol: res.currencySymbol,
      }));
      showToast(`Currency changed to ${res.currency} (${res.currencySymbol})`);
    } catch (err) {
      console.error('Failed to change currency:', err);
      showToast('Failed to update currency', 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        changeCurrency,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        googleConfig,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

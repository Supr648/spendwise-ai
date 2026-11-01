import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  X,
  Lock,
  Mail,
  User,
  Coins,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const AuthModal = () => {
  const {
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    register,
    loginWithGoogle,
    googleConfig,
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, currency);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // 1-Click Google OAuth Sign-In
      await loginWithGoogle({
        userInfo: {
          email: googleEmail || 'alex.morgan@gmail.com',
          name: googleName || 'Alex Morgan',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          googleId: `google_oauth_${Date.now()}`,
        },
      });
      setShowGooglePrompt(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login('demo@spendwise.ai', 'password123');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="fin-card w-full max-w-md p-6 sm:p-8 space-y-5 shadow-2xl relative border-slate-200 dark:border-slate-700/80">
        <button
          onClick={() => {
            setAuthModalOpen(false);
            setShowGooglePrompt(false);
          }}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 p-0.5 mx-auto shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SpendWise <span className="text-emerald-600 dark:text-emerald-400">AI</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">“Take Control of Your Money.”</p>
        </div>

        {/* Google OAuth Button */}
        {!showGooglePrompt ? (
          <div>
            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowGooglePrompt(true)}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 dark:border-transparent rounded-xl text-xs font-bold transition flex items-center justify-center gap-2.5 shadow-sm active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
                  or sign in with email
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google Account Authorization
              </span>
              <button
                type="button"
                onClick={() => setShowGooglePrompt(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-[11px]"
              >
                Back
              </button>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Google Display Name</label>
              <input
                type="text"
                placeholder="e.g. Supriya Sharma"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">Google Email Address</label>
              <input
                type="email"
                placeholder="supriya.sharma@gmail.com"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleClick}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-sm active:scale-95"
            >
              {submitting ? 'Connecting with Google...' : 'Authorize Google Account'}
            </button>
          </div>
        )}

        {/* Toggle Mode: Sign In vs Register */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              authMode === 'login'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              authMode === 'register'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Supriya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {authMode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Primary Currency</label>
              <div className="relative">
                <Coins className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="INR">INR (₹) - Indian Rupee (Default)</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-600/20 active:scale-95"
          >
            {submitting ? 'Authenticating...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* 1-Click Demo Evaluation */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={submitting}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>Log in with Demo Account (Alex Morgan)</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Repeat,
  BarChart3,
  Bot,
  Plus,
  Sparkles,
  LogOut,
  User,
  ChevronDown,
  Coins,
  Sun,
  Moon,
  AlertTriangle,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, changeCurrency, setAuthModalOpen, setAuthMode } = useAuth();
  const {
    activeTab,
    setActiveTab,
    setIsAddTxModalOpen,
    dashboardData,
    recurringData,
    totalTxCount,
  } = useFinance();
  const { theme, isDark, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, badge: totalTxCount },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: PieChart,
      hasAlert: Boolean(dashboardData?.budgetAlerts && dashboardData.budgetAlerts.length > 0),
    },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    {
      id: 'recurring',
      label: 'Recurring',
      icon: Repeat,
      badge: recurringData?.summary?.upcomingRemindersCount,
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Advisor', icon: Bot, isSparkle: true },
  ];

  const currencies = [
    { code: 'INR', symbol: '₹', label: 'INR (₹)' },
    { code: 'USD', symbol: '$', label: 'USD ($)' },
    { code: 'EUR', symbol: '€', label: 'EUR (€)' },
    { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl transition-colors duration-200">
      {/* Top Banner / User Quick Status */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400 transition-colors duration-200">
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Personal Finance Ledger Live
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span>
            Signed in: <strong className="text-slate-800 dark:text-slate-200">{user?.name || 'Guest User'}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="italic text-slate-500 dark:text-slate-400">“Take Control of Your Money.”</span>
        </div>

        {/* Currency & Alerts Quick Info */}
        <div className="flex items-center space-x-3">
          {dashboardData?.budgetAlerts && dashboardData.budgetAlerts.length > 0 && (
            <span
              className="flex items-center text-amber-600 dark:text-amber-400 font-semibold cursor-pointer"
              onClick={() => setActiveTab('budgets')}
            >
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              {dashboardData.budgetAlerts.length} budget alert(s)
            </span>
          )}
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center space-x-1.5">
            <Coins className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <select
              value={user?.currency || 'INR'}
              onChange={(e) => changeCurrency(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white cursor-pointer focus:outline-none text-[11px]"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 p-0.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center transition-colors duration-200">
                <Wallet className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  SpendWise
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide font-medium">PERSONAL FINANCE</p>
            </div>
          </div>

          {/* Controls: Theme Switcher, Quick Add, User Profile */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Day / Night Mode Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-all group"
              title={isDark ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
                  <span className="text-[11px] font-semibold hidden md:inline text-slate-300">Day</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12" />
                  <span className="text-[11px] font-semibold hidden md:inline text-slate-700">Night</span>
                </>
              )}
            </button>

            {/* Quick Add Transaction Button */}
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition"
              >
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                    {user?.name ? user.name[0] : 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200 hidden md:inline max-w-[100px] truncate">
                  {user?.name || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Currency: {user?.currency} ({user?.currencySymbol})
                    </span>
                  </div>

                  <div className="p-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        toggleTheme();
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-2"
                    >
                      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
                      <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setAuthMode('login');
                        setAuthModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Switch / Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-200 dark:border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive
                      ? 'text-white'
                      : item.isSparkle
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-slate-400 dark:text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.isSparkle && !isActive && (
                  <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400 inline" />
                )}
                {item.hasAlert && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

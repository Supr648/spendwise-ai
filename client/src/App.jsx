import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { BudgetsView } from './components/BudgetsView';
import { GoalsView } from './components/GoalsView';
import { RecurringView } from './components/RecurringView';
import { ReportsView } from './components/ReportsView';
import { AiInsightsView } from './components/AiInsightsView';
import { LandingView } from './components/LandingView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AuthModal } from './components/AuthModal';
import { AlertCircle, RefreshCw, Wallet, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const ToastNotification = () => {
  const { toast } = useAuth();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
    info: <Info className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 text-emerald-900 dark:text-emerald-200 shadow-emerald-500/10',
    error: 'border-rose-500/30 bg-white/95 dark:bg-slate-900/95 text-rose-900 dark:text-rose-200 shadow-rose-500/10',
    warning: 'border-amber-500/30 bg-white/95 dark:bg-slate-900/95 text-amber-900 dark:text-amber-200 shadow-amber-500/10',
    info: 'border-cyan-500/30 bg-white/95 dark:bg-slate-900/95 text-cyan-900 dark:text-cyan-200 shadow-cyan-500/10',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-xl text-xs font-medium ${
          borderStyles[toast.type] || borderStyles.success
        }`}
      >
        {icons[toast.type] || icons.success}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const { activeTab, setActiveTab, loading, error, refreshAll } = useFinance();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 dark:text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={refreshAll}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-800 text-rose-800 dark:text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Global Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Loading your personal finance ledger...</p>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'transactions' && <TransactionsView />}
            {activeTab === 'budgets' && <BudgetsView />}
            {activeTab === 'goals' && <GoalsView />}
            {activeTab === 'recurring' && <RecurringView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'ai-insights' && <AiInsightsView />}
            {activeTab === 'landing' && <LandingView />}
          </>
        )}
      </main>

      {/* SpendWise Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> SpendWise AI
            </span>
            <span>•</span>
            <span>Personal Finance Tracker</span>
            <span>•</span>
            <span className="italic text-slate-400 dark:text-slate-500">“Take Control of Your Money.”</span>
          </div>

          <p className="text-[11px] text-center md:text-right text-slate-500 dark:text-slate-500">
            Private, secure, single-tenant personal financial intelligence.
          </p>
        </div>
      </footer>

      {/* Modals & Notifications */}
      <AddTransactionModal />
      <AuthModal />
      <ToastNotification />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <MainLayout />
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

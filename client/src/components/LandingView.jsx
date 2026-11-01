import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  ArrowRight,
  Sparkles,
  PieChart,
  Target,
  Repeat,
  BarChart3,
  Bot,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const LandingView = () => {
  const { setActiveTab, setIsAddTxModalOpen } = useFinance();
  const { setAuthModalOpen, setAuthMode } = useAuth();

  const features = [
    {
      title: 'Real-Time Cash Flow & Balances',
      desc: 'Accurately monitor liquid bank balances, income deposits, and outgoing expenses with automatic savings rate tracking.',
      icon: Wallet,
      color: 'text-emerald-500 dark:text-emerald-400',
    },
    {
      title: 'Smart Category Budgets',
      desc: 'Set monthly limits for Groceries, Dining Out, Rent, and Utilities. Get early warning alerts before exceeding your budget.',
      icon: PieChart,
      color: 'text-blue-500 dark:text-blue-400',
    },
    {
      title: 'Savings Goals with Completion Forecasts',
      desc: 'Track progress toward emergency funds, travel vacations, and major life milestones with contribution velocity estimates.',
      icon: Target,
      color: 'text-purple-500 dark:text-purple-400',
    },
    {
      title: 'Recurring Bills & Subscriptions',
      desc: 'Never miss a rent deadline or get surprised by recurring media charges with 7-day payment due reminders.',
      icon: Repeat,
      color: 'text-cyan-500 dark:text-cyan-400',
    },
    {
      title: '12-Month Reports & CSV Export',
      desc: 'Analyze multi-month income vs. expense trends, category distributions, and generate printable PDF summaries.',
      icon: BarChart3,
      color: 'text-amber-500 dark:text-amber-400',
    },
    {
      title: 'Conversational AI Finance Advisor',
      desc: 'Grounded personal finance AI assistant identifying budget overruns and offering realistic savings recommendations.',
      icon: Bot,
      color: 'text-rose-500 dark:text-rose-400',
    },
  ];

  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-slate-950 border border-slate-200 dark:border-slate-800 p-8 md:p-14 text-center shadow-lg dark:shadow-2xl transition-colors duration-200">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Personal Finance Tracker</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Take Control of Your Money with <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">SpendWise AI</span>
        </h1>

        <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Effortlessly track income and expenses, enforce category budgets, achieve savings goals, audit recurring bills, and optimize personal cash flow with intelligent AI guidance.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition transform hover:-translate-y-0.5 active:scale-95"
          >
            <span>Launch Financial Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddTxModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Record a Transaction</span>
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="fin-card p-6 fin-card-hover flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
                  <Icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Guarantee */}
      <div className="fin-card p-6 bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">Strict Personal Financial Privacy</h4>
            <p>Your ledger is isolated per user. Data is never shared or sold to third-party ad networks.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-[11px] font-mono">
          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% User Data Isolated
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>Encrypted Password Hashes</span>
        </div>
      </div>
    </div>
  );
};

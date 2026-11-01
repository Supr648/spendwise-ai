import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { api } from '../services/api';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Calendar,
  X,
  TrendingUp,
} from 'lucide-react';

export const BudgetsView = () => {
  const {
    budgetsData,
    refreshBudgets,
    refreshDashboard,
    formatCurrency,
    isAddBudgetModalOpen,
    setIsAddBudgetModalOpen,
  } = useFinance();

  const [category, setCategory] = useState('Groceries');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Rent & Housing', 'Groceries', 'Dining Out', 'Transportation',
    'Utilities', 'Subscriptions', 'Healthcare', 'Shopping',
    'Entertainment', 'General'
  ];

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) return;
    setSubmitting(true);
    try {
      await api.createBudget({
        category,
        monthlyLimit: parseFloat(monthlyLimit),
      });
      setIsAddBudgetModalOpen(false);
      setMonthlyLimit('');
      refreshBudgets();
      refreshDashboard();
    } catch (err) {
      alert(`Error creating budget: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await api.deleteBudget(id);
      refreshBudgets();
      refreshDashboard();
    } catch (err) {
      alert(`Error removing budget: ${err.message}`);
    }
  };

  const budgets = budgetsData?.budgets || [];
  const summary = budgetsData?.summary || {};

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="fin-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Monthly Category Budgets</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set spending limits, monitor progress, and receive near-limit alerts before you overspend.
            </p>
          </div>

          <button
            onClick={() => setIsAddBudgetModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition self-start md:self-auto shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category Budget</span>
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Total Budget Cap</span>
            <span className="text-xl font-mono font-bold text-slate-900 dark:text-white block">
              {formatCurrency(summary.totalLimit)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Across {budgets.length} categories</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Total Spent</span>
            <span className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 block">
              {formatCurrency(summary.totalSpent)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{summary.totalPercent}% of overall cap</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Remaining Buffer</span>
            <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
              {formatCurrency(summary.totalRemaining)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Unspent allocation</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Alerts Triggered</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xl font-mono font-bold ${summary.overBudgetCount > 0 ? 'text-rose-600 dark:text-rose-400' : summary.nearLimitCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {summary.overBudgetCount + summary.nearLimitCount}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ({summary.overBudgetCount} exceeded, {summary.nearLimitCount} near limit)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => {
          const isExceeded = b.status === 'exceeded';
          const isWarning = b.status === 'warning';

          return (
            <div
              key={b.id}
              className={`fin-card fin-card-hover p-6 flex flex-col justify-between border-l-4 transition ${
                isExceeded
                  ? 'border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/10'
                  : isWarning
                  ? 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/10'
                  : 'border-l-emerald-500 bg-white dark:bg-slate-900/70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{b.category}</h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Limit: {formatCurrency(b.monthlyLimit)} / mo
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteBudget(b.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Remove Budget"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">
                      Spent: {formatCurrency(b.spent)}
                    </span>
                    <span className={`font-mono font-bold ${
                      isExceeded ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {b.percentUsed}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  <span>
                    Remaining:{' '}
                    <strong className={b.remaining === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}>
                      {formatCurrency(b.remaining)}
                    </strong>
                  </span>
                  {b.changeFromPrevPercent !== null && (
                    <span className={b.changeFromPrevPercent > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {b.changeFromPrevPercent > 0 ? '+' : ''}{b.changeFromPrevPercent}% vs last mo
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                {isExceeded ? (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Exceeded limit by {formatCurrency(b.spent - b.monthlyLimit)}
                  </span>
                ) : isWarning ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Approaching monthly limit
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Within healthy limit
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Budget Modal */}
      {isAddBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="fin-card w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Set Category Budget
              </h3>
              <button onClick={() => setIsAddBudgetModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Monthly Spending Cap ({formatCurrency(0).slice(0, 1)})
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 15000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
                >
                  {submitting ? 'Saving...' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

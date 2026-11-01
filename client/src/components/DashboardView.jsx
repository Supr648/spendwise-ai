import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'
];

export const DashboardView = () => {
  const {
    dashboardData,
    formatCurrency,
    setActiveTab,
    setIsAddTxModalOpen,
  } = useFinance();
  const { isDark } = useTheme();

  if (!dashboardData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Computing personal finance metrics...</p>
      </div>
    );
  }

  const { metrics, categorySpending, monthlyComparison, recentTransactions, budgetAlerts, currentMonth } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Budget Overrun / Near Limit Alert Banner */}
      {budgetAlerts && budgetAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in transition-colors duration-200">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-950 dark:text-amber-200 block sm:inline mr-2">Budget Attention Needed:</span>
              <span>
                {budgetAlerts.map((a) => `${a.category} (${a.percentage}%)`).join(', ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('budgets')}
            className="px-3.5 py-1.5 bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 rounded-xl text-xs font-semibold whitespace-nowrap transition shadow-sm"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* Top 5 KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Balance */}
        <div className="fin-card fin-card-hover p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span className="font-medium">Total Balance</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mb-1">
            {formatCurrency(metrics.totalBalance)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Available Liquid Funds</span>
        </div>

        {/* Monthly Income */}
        <div className="fin-card fin-card-hover p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span className="font-medium">Income ({currentMonth.split(' ')[0]})</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mb-1">
            +{formatCurrency(metrics.monthlyIncome)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Monthly Inflow</span>
        </div>

        {/* Monthly Expenses */}
        <div className="fin-card fin-card-hover p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span className="font-medium">Expenses ({currentMonth.split(' ')[0]})</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mb-1">
            -{formatCurrency(metrics.monthlyExpenses)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Monthly Outflow</span>
        </div>

        {/* Net Savings */}
        <div className="fin-card fin-card-hover p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span className="font-medium">Net Savings</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono mb-1 ${metrics.netSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {metrics.netSavings >= 0 ? '+' : ''}{formatCurrency(metrics.netSavings)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Income minus Expenses</span>
        </div>

        {/* Savings Rate & Budget Progress */}
        <div className="fin-card fin-card-hover p-5">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span className="font-medium">Savings Rate</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mb-1">
            {metrics.savingsRate}%
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Budget used:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{metrics.budgetUsagePercent}%</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Income vs Expense Bar Chart */}
        <div className="fin-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                6-Month Cash Flow (Income vs. Expenses)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multi-month visual inflow and outflow comparison</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Full Report →
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
                <XAxis dataKey="month" stroke={isDark ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                    borderRadius: '12px',
                    color: isDark ? '#f8fafc' : '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(val) => [formatCurrency(val), '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Spending Distribution */}
        <div className="fin-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Spending by Category
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Current Month</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Where your money went this month</p>

            {categorySpending.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-10 text-center">No expenses recorded this month.</p>
            ) : (
              <div className="space-y-3.5">
                {categorySpending.slice(0, 5).map((cat, i) => (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.category}</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">
                        {formatCurrency(cat.amount)} <span className="text-slate-400 dark:text-slate-500 text-[10px]">({cat.percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, cat.percentage)}%`,
                          backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Outflow:</span>
            <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">{formatCurrency(metrics.monthlyExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Transactions Table & Quick Actions */}
      <div className="fin-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Recent Transactions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest recorded income deposits and expense purchases</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              View All ({metrics.transactionCount})
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto mt-4">
          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              No transactions found. Click "Record Transaction" above to add your first expense or income!
            </div>
          ) : (
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description / Notes</th>
                  <th>Payment Method</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => {
                  const isInc = tx.type === 'income';
                  return (
                    <tr key={tx.id}>
                      <td className="font-mono text-slate-500 dark:text-slate-400">{tx.date}</td>
                      <td>
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {tx.category}
                        </span>
                      </td>
                      <td className="text-slate-700 dark:text-slate-300 font-sans max-w-xs truncate">{tx.notes || '—'}</td>
                      <td className="text-slate-500 dark:text-slate-400">{tx.paymentMethod || 'UPI'}</td>
                      <td className={`text-right font-mono font-bold ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isInc ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

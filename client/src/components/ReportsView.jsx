import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
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
  LineChart,
  Line,
} from 'recharts';

export const ReportsView = () => {
  const { reportsData, refreshReports, formatCurrency } = useFinance();
  const { isDark } = useTheme();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    refreshReports(selectedYear);
  }, [selectedYear, refreshReports]);

  const summary = reportsData?.annualSummary || {};
  const monthly = reportsData?.monthlyBreakdown || [];
  const categories = reportsData?.categoryAnalysis || [];

  const handleExportAnnualCSV = () => {
    if (!monthly.length) return;
    const headers = ['Month', 'Income', 'Expenses', 'Net Savings', 'Savings Rate %', 'Transactions Count'];
    const rows = monthly.map((m) => [
      m.yearMonth,
      m.income,
      m.expenses,
      m.netSavings,
      `${m.savingsRate}%`,
      m.transactionCount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `SpendWise_Annual_Report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="fin-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Annual Financial Performance &amp; Reports</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit yearly income, spending velocity, net savings, and category distributions with exportable reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Year Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs text-slate-800 dark:text-white font-bold cursor-pointer focus:outline-none"
              >
                <option value={2026} className="bg-white dark:bg-slate-900">FY 2026</option>
                <option value={2025} className="bg-white dark:bg-slate-900">FY 2025</option>
                <option value={2024} className="bg-white dark:bg-slate-900">FY 2024</option>
              </select>
            </div>

            <button
              onClick={handleExportAnnualCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition shadow-sm active:scale-95 no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF Report</span>
            </button>
          </div>
        </div>

        {/* Annual KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Annual Inflow</span>
            <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
              +{formatCurrency(summary.totalIncome || 0)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Total credited</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Annual Outflow</span>
            <span className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 block">
              -{formatCurrency(summary.totalExpenses || 0)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Total debited</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Net Retained Savings</span>
            <span className={`text-xl font-mono font-bold block ${summary.netSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {summary.netSavings >= 0 ? '+' : ''}{formatCurrency(summary.netSavings || 0)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Retained capital</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Annual Savings Rate</span>
            <span className="text-xl font-mono font-bold text-purple-600 dark:text-purple-400 block">
              {summary.savingsRate || 0}%
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Across {summary.totalTransactions || 0} entries</span>
          </div>
        </div>
      </div>

      {/* 12-Month Performance Chart */}
      <div className="fin-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          12-Month Cash Velocity (FY {selectedYear})
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Monthly revenue inflow vs monthly living expenditure</p>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
              <XAxis dataKey="yearMonth" stroke={isDark ? '#64748b' : '#94a3b8'} tick={{ fontSize: 11 }} />
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
              <Bar dataKey="income" name="Inflow (+)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Outflow (-)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="fin-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Detailed Monthly Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Inflow</th>
                <th>Outflow</th>
                <th>Net Savings</th>
                <th>Savings Rate</th>
                <th className="text-right">Transaction Volume</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => (
                <tr key={m.yearMonth}>
                  <td className="font-bold text-slate-900 dark:text-white">{m.yearMonth}</td>
                  <td className="font-mono text-emerald-600 dark:text-emerald-400">+{formatCurrency(m.income)}</td>
                  <td className="font-mono text-rose-600 dark:text-rose-400">-{formatCurrency(m.expenses)}</td>
                  <td className={`font-mono font-bold ${m.netSavings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {m.netSavings >= 0 ? '+' : ''}{formatCurrency(m.netSavings)}
                  </td>
                  <td>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {m.savingsRate}%
                    </span>
                  </td>
                  <td className="text-right font-mono text-slate-500 dark:text-slate-400">{m.transactionCount} records</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

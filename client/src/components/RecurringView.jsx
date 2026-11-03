import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { api } from '../services/api';
import {
  Repeat,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Bell,
  X,
  CreditCard,
} from 'lucide-react';

export const RecurringView = () => {
  const {
    recurringData,
    refreshRecurring,
    refreshDashboard,
    formatCurrency,
    isAddRecurringModalOpen,
    setIsAddRecurringModalOpen,
  } = useFinance();

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Subscriptions');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Rent & Housing', 'Subscriptions', 'Utilities', 'Transportation',
    'Groceries', 'Healthcare', 'Salary', 'Freelance', 'General'
  ];

  const handleCreateRecurring = async (e) => {
    e.preventDefault();
    if (!name.trim() || !amount) return;
    setSubmitting(true);
    try {
      await api.createRecurring({
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        category,
        frequency,
        nextDueDate,
      });
      setIsAddRecurringModalOpen(false);
      setName('');
      setAmount('');
      setNextDueDate('');
      refreshRecurring();
      refreshDashboard();
    } catch (err) {
      alert(`Error creating recurring payment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.toggleRecurring(id);
      refreshRecurring();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteRecurring(id);
      refreshRecurring();
    } catch (err) {
      alert(`Error deleting recurring payment: ${err.message}`);
    }
  };

  const recurringList = recurringData?.recurring || [];
  const summary = recurringData?.summary || {};
  const reminders = recurringData?.upcomingReminders || [];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="fin-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Repeat className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recurring Subscriptions &amp; Cash Flows</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage automatic recurring bills, OTT subscriptions, house rent, and regular salary inflows.
            </p>
          </div>

          <button
            onClick={() => setIsAddRecurringModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition self-start md:self-auto shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recurring Payment</span>
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Active Subscriptions</span>
            <span className="text-xl font-mono font-bold text-slate-900 dark:text-white block">
              {summary.activeCount || 0}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">of {summary.totalRecurringCount || 0} scheduled</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Monthly Recurring Outflow</span>
            <span className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400 block">
              {formatCurrency(summary.monthlyCommittedExpenses || 0)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Fixed commitments</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Monthly Recurring Inflow</span>
            <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
              {formatCurrency(summary.monthlyCommittedIncome || 0)}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Salary &amp; contracts</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Upcoming in 7 Days</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xl font-mono font-bold ${reminders.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {reminders.length}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">due shortly</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Payment Reminders Banner */}
      {reminders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs flex items-center justify-between shadow-sm animate-in fade-in transition">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-amber-950 dark:text-amber-200 block sm:inline mr-2">Upcoming Renewals &amp; Dues:</span>
              <span>
                {reminders.map((r) => `${r.name} (${formatCurrency(r.amount)} on ${r.nextDueDate})`).join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Ledger Card */}
      <div className="fin-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Scheduled Subscriptions &amp; Regular Inflows
        </h3>

        <div className="overflow-x-auto">
          {recurringList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
              No recurring payments recorded. Click "Add Recurring Payment" to schedule monthly bills or salaries.
            </div>
          ) : (
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Frequency</th>
                  <th>Next Due Date</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recurringList.map((rec) => {
                  const isInc = rec.type === 'income';
                  const isActive = rec.status === 'active';

                  return (
                    <tr key={rec.id} className={!isActive ? 'opacity-60' : ''}>
                      <td>
                        <button
                          onClick={() => handleToggleStatus(rec.id)}
                          className="flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                          title="Click to toggle active/pause"
                        >
                          {isActive ? (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              Paused
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="font-bold text-slate-900 dark:text-white font-sans">{rec.name}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          isInc
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {isInc ? 'Inflow' : 'Outflow'}
                        </span>
                      </td>
                      <td className="text-slate-700 dark:text-slate-300">{rec.category}</td>
                      <td className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono tracking-wider">{rec.frequency}</td>
                      <td className="font-mono text-slate-700 dark:text-slate-300">{rec.nextDueDate || '—'}</td>
                      <td className={`text-right font-mono font-bold text-sm ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isInc ? '+' : '-'}{formatCurrency(rec.amount)}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                          title="Delete Recurring Payment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Recurring Modal */}
      {isAddRecurringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="fin-card w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Add Recurring Commitment
              </h3>
              <button onClick={() => setIsAddRecurringModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecurring} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Apartment Rent, Monthly Salary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Next Due Date</label>
                <input
                  type="date"
                  required
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRecurringModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
                >
                  {submitting ? 'Saving...' : 'Save Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

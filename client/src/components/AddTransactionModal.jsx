import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Plus, X, AlertTriangle } from 'lucide-react';

export const AddTransactionModal = () => {
  const { user } = useAuth();
  const {
    isAddTxModalOpen,
    setIsAddTxModalOpen,
    refreshTransactions,
    refreshDashboard,
    refreshBudgets,
    formatCurrency,
  } = useFinance();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const categories = [
    'Rent & Housing', 'Groceries', 'Dining Out', 'Transportation',
    'Utilities', 'Subscriptions', 'Healthcare', 'Shopping',
    'Entertainment', 'Salary', 'Freelance', 'Investments', 'General'
  ];

  if (!isAddTxModalOpen) return null;

  const handleSubmit = async (e, forceSave = false) => {
    if (e) e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setSubmitting(true);
    setDuplicateWarning(null);

    try {
      await api.createTransaction({
        amount: parseFloat(amount),
        type,
        category,
        date,
        paymentMethod,
        notes,
        forceSave,
      });

      // Reset and close
      setAmount('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsAddTxModalOpen(false);
      refreshTransactions();
      refreshDashboard();
      refreshBudgets();
    } catch (err) {
      if (err.isDuplicate) {
        setDuplicateWarning(err.message);
      } else {
        alert(`Error: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="fin-card w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Record Transaction
          </h3>
          <button
            onClick={() => {
              setIsAddTxModalOpen(false);
              setDuplicateWarning(null);
            }}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Duplicate Warning Prompt */}
        {duplicateWarning && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Potential Duplicate Detected</span>
            </div>
            <p>{duplicateWarning}</p>
            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs shadow-sm"
              >
                Save Anyway
              </button>
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-3.5">
          {/* Income or Expense selector */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  type === 'expense'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 text-xs font-bold rounded-xl border transition ${
                  type === 'income'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Amount ({formatCurrency(0).slice(0, 1)})
            </label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-base font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Category</label>
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

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Notes / Merchant</label>
            <input
              type="text"
              placeholder="e.g. Swiggy order, Amazon books, Salary credit"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsAddTxModalOpen(false);
                setDuplicateWarning(null);
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
            >
              {submitting ? 'Recording...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

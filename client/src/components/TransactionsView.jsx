import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { api } from '../services/api';
import {
  ArrowLeftRight,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const TransactionsView = () => {
  const {
    transactions,
    refreshTransactions,
    refreshDashboard,
    formatCurrency,
    setIsAddTxModalOpen,
    editingTransaction,
    setEditingTransaction,
    isImportModalOpen,
    setIsImportModalOpen,
  } = useFinance();

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state for editing
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState('expense');
  const [formCategory, setFormCategory] = useState('Groceries');
  const [formDate, setFormDate] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('UPI');
  const [formNotes, setFormNotes] = useState('');

  // CSV Import State
  const [csvInput, setCsvInput] = useState('');
  const [importStatus, setImportStatus] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const categories = [
    'Rent & Housing', 'Groceries', 'Dining Out', 'Transportation',
    'Utilities', 'Subscriptions', 'Healthcare', 'Shopping',
    'Entertainment', 'Salary', 'Freelance', 'Investments', 'General'
  ];

  // Refresh with active filters
  const applyFilters = () => {
    refreshTransactions({
      search,
      category: selectedCategory === 'ALL' ? '' : selectedCategory,
      type: selectedType,
      startDate,
      endDate,
    });
  };

  useEffect(() => {
    applyFilters();
  }, [search, selectedCategory, selectedType, startDate, endDate]);

  const handleDelete = async (id) => {
    try {
      await api.deleteTransaction(id);
      refreshTransactions();
      refreshDashboard();
      setDeleteConfirmId(null);
    } catch (err) {
      alert(`Error deleting transaction: ${err.message}`);
    }
  };

  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setFormAmount(String(tx.amount));
    setFormType(tx.type);
    setFormCategory(tx.category || 'General');
    setFormDate(tx.date || '');
    setFormPaymentMethod(tx.paymentMethod || 'UPI');
    setFormNotes(tx.notes || '');
    setShowEditModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingTransaction) return;
    try {
      await api.updateTransaction(editingTransaction.id, {
        amount: parseFloat(formAmount),
        type: formType,
        category: formCategory,
        date: formDate,
        paymentMethod: formPaymentMethod,
        notes: formNotes,
      });
      setShowEditModal(false);
      setEditingTransaction(null);
      refreshTransactions();
      refreshDashboard();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = transactions.map((t) => [
      t.date,
      t.type,
      `"${t.category || ''}"`,
      t.amount,
      `"${t.paymentMethod || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `SpendWise_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSVSubmit = async () => {
    if (!csvInput.trim()) return;
    setIsImporting(true);
    setImportStatus(null);
    try {
      const res = await api.importTransactionsCSV(csvInput);
      setImportStatus({ success: true, message: res.message });
      refreshTransactions();
      refreshDashboard();
      setTimeout(() => {
        setIsImportModalOpen(false);
        setCsvInput('');
        setImportStatus(null);
      }, 2000);
    } catch (err) {
      setImportStatus({ success: false, message: err.message });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="fin-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <ArrowLeftRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transactions Management</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track, categorize, search, and audit your personal income and expense records.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddTxModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Types (Income &amp; Expense)</option>
              <option value="income">Income Only (+)</option>
              <option value="expense">Expense Only (-)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              title="Start Date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="fin-card p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {transactions.length} filtered transactions</span>
          {(search || selectedCategory !== 'ALL' || selectedType || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('ALL');
                setSelectedType('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="overflow-x-auto mt-2">
          {transactions.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs">
              No transactions match your current filters.
            </div>
          ) : (
            <table className="fin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description / Notes</th>
                  <th>Payment Method</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isInc = tx.type === 'income';
                  return (
                    <tr key={tx.id}>
                      <td className="font-mono text-slate-500 dark:text-slate-400">{tx.date}</td>
                      <td>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          isInc
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {isInc ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{tx.category}</span>
                      </td>
                      <td className="text-slate-600 dark:text-slate-300 font-sans max-w-sm truncate">{tx.notes || '—'}</td>
                      <td className="text-slate-500 dark:text-slate-400">{tx.paymentMethod || 'UPI'}</td>
                      <td className={`text-right font-mono font-bold text-sm ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isInc ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleEditClick(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="fin-card w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              Confirm Delete Transaction
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete this transaction? This will automatically recalculate your total balance and budget limits.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="fin-card w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Edit Transaction
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      formType === 'expense'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                    }`}
                  >
                    Expense (-)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      formType === 'income'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
                    }`}
                  >
                    Income (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
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

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="fin-card w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Import Transactions from CSV</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Paste raw CSV text below. Header format should include: <code>Date, Amount, Type, Category, Notes, Method</code>.
              Duplicates with identical date, amount, and category will be automatically detected and skipped.
            </p>

            <textarea
              rows={6}
              placeholder={`Date,Amount,Type,Category,Notes,Method\n2026-10-20,1200,expense,Groceries,Weekly grocery,UPI\n2026-10-22,85000,income,Salary,Monthly salary,Bank`}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            />

            {importStatus && (
              <div className={`p-3 rounded-xl text-xs ${
                importStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
              }`}>
                {importStatus.message}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
              <button
                type="button"
                disabled={!csvInput.trim() || isImporting}
                onClick={handleImportCSVSubmit}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
              >
                {isImporting ? 'Processing...' : 'Run CSV Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

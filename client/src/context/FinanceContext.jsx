import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Core Datasets
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [totalTxCount, setTotalTxCount] = useState(0);
  const [budgetsData, setBudgetsData] = useState(null);
  const [goalsData, setGoalsData] = useState(null);
  const [recurringData, setRecurringData] = useState(null);
  const [reportsData, setReportsData] = useState(null);

  // Modals state
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isAddRecurringModalOpen, setIsAddRecurringModalOpen] = useState(false);
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [targetGoal, setTargetGoal] = useState(null);

  // Load Dashboard Summary
  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getDashboardSummary();
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    }
  }, [isAuthenticated]);

  // Load Transactions with optional query filters
  const refreshTransactions = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getTransactions(filters);
      setTransactions(res.transactions || []);
      setTotalTxCount(res.totalCount || 0);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  }, [isAuthenticated]);

  // Load Budgets
  const refreshBudgets = useCallback(async (month, year) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getBudgets(month, year);
      setBudgetsData(res);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    }
  }, [isAuthenticated]);

  // Load Goals
  const refreshGoals = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getGoals();
      setGoalsData(res);
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  }, [isAuthenticated]);

  // Load Recurring
  const refreshRecurring = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getRecurring();
      setRecurringData(res);
    } catch (err) {
      console.error('Failed to load recurring:', err);
    }
  }, [isAuthenticated]);

  // Load Reports
  const refreshReports = useCallback(async (year) => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getReports(year);
      setReportsData(res);
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  }, [isAuthenticated]);

  // Refresh all core financial state
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.allSettled([
        refreshDashboard(),
        refreshTransactions(),
        refreshBudgets(),
        refreshGoals(),
        refreshRecurring(),
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, refreshDashboard, refreshTransactions, refreshBudgets, refreshGoals, refreshRecurring]);

  // Sync on auth ready
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, user?.currency, refreshAll]);

  // Helper formatting currency
  const formatCurrency = (amount) => {
    const symbol = user?.currencySymbol || '₹';
    if (amount === null || amount === undefined || isNaN(amount)) return `${symbol}0`;
    return `${symbol}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        loading,
        error,
        formatCurrency,
        dashboardData,
        refreshDashboard,
        transactions,
        totalTxCount,
        refreshTransactions,
        budgetsData,
        refreshBudgets,
        goalsData,
        refreshGoals,
        recurringData,
        refreshRecurring,
        reportsData,
        refreshReports,
        refreshAll,
        // Modals
        isAddTxModalOpen,
        setIsAddTxModalOpen,
        editingTransaction,
        setEditingTransaction,
        isImportModalOpen,
        setIsImportModalOpen,
        isAddBudgetModalOpen,
        setIsAddBudgetModalOpen,
        isAddGoalModalOpen,
        setIsAddGoalModalOpen,
        isAddRecurringModalOpen,
        setIsAddRecurringModalOpen,
        isContribModalOpen,
        setIsContribModalOpen,
        targetGoal,
        setTargetGoal,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};


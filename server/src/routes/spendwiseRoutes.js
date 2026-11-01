import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  register,
  login,
  googleAuth,
  getGoogleConfig,
  getMe,
  updateCurrency,
  getAccounts,
  createAccount,
  deleteAccount,
} from '../controllers/authController.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactionsCSV,
} from '../controllers/transactionController.js';
import { getBudgets, createBudget, deleteBudget } from '../controllers/budgetController.js';
import { getGoals, createGoal, addContribution, deleteGoal } from '../controllers/goalController.js';
import { getRecurring, createRecurring, toggleRecurringStatus, deleteRecurring } from '../controllers/recurringController.js';
import { getFinancialReports } from '../controllers/reportController.js';
import { getAiInsights } from '../controllers/aiController.js';

const router = express.Router();

// 1. Authentication Routes (Public)
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/google', googleAuth);
router.get('/auth/google-config', getGoogleConfig);

// Protected routes below
router.use(requireAuth);

// User profile & preferences
router.get('/auth/me', getMe);
router.put('/auth/currency', updateCurrency);

// Bank & Cash Accounts
router.get('/accounts', getAccounts);
router.post('/accounts', createAccount);
router.delete('/accounts/:id', deleteAccount);

// 2. Dashboard
router.get('/dashboard/summary', getDashboardSummary);

// 3. Transactions CRUD & Import
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);
router.delete('/transactions/:id', deleteTransaction);
router.post('/transactions/import-csv', importTransactionsCSV);

// 4. Budgets
router.get('/budgets', getBudgets);
router.post('/budgets', createBudget);
router.delete('/budgets/:id', deleteBudget);

// 5. Savings Goals
router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.post('/goals/:id/contributions', addContribution);
router.delete('/goals/:id', deleteGoal);

// 6. Recurring Transactions
router.get('/recurring', getRecurring);
router.post('/recurring', createRecurring);
router.put('/recurring/:id/toggle', toggleRecurringStatus);
router.delete('/recurring/:id', deleteRecurring);

// 7. Reports
router.get('/reports', getFinancialReports);

// 8. AI Spending Insights
router.post('/ai/insights', getAiInsights);

export default router;

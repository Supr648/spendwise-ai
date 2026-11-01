import { readDB } from '../db/database.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = readDB();

    const userAccounts = db.accounts.filter((a) => a.userId === userId);
    const userTransactions = db.transactions.filter((t) => t.userId === userId);
    const userBudgets = db.budgets.filter((b) => b.userId === userId);

    // Current Date Parameters
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const currentMonthStr = String(currentMonthNum).padStart(2, '0');
    const currentYM = `${currentYear}-${currentMonthStr}`;

    // 1. Total Balance across all user accounts
    // Calculate dynamically from initial account balances + all historical income - all expenses
    let calculatedBalance = userAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    // Alternatively compute net cash flow from transactions
    const totalAllIncome = userTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const totalAllExpenses = userTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalBalance = Math.max(0, calculatedBalance);

    // 2. Current Month Income & Expenses
    const currentMonthTransactions = userTransactions.filter((t) => {
      return t.date && t.date.startsWith(currentYM);
    });

    const monthlyIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const monthlyExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // 3. Net Savings & Savings Rate
    const netSavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0
      ? Math.max(0, Number(((netSavings / monthlyIncome) * 100).toFixed(1)))
      : 0;

    // 4. Budget Usage
    // Current month budgets
    const activeBudgets = userBudgets.filter(
      (b) => (!b.month || b.month === currentMonthNum) && (!b.year || b.year === currentYear)
    );
    const totalBudgetLimit = activeBudgets.reduce((sum, b) => sum + (Number(b.monthlyLimit) || 0), 0);

    // Total expenses in budgeted categories
    const budgetedCategories = new Set(activeBudgets.map((b) => b.category.toLowerCase()));
    const budgetedSpending = currentMonthTransactions
      .filter((t) => t.type === 'expense' && budgetedCategories.has((t.category || '').toLowerCase()))
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const budgetUsagePercent = totalBudgetLimit > 0
      ? Number(((budgetedSpending / totalBudgetLimit) * 100).toFixed(1))
      : 0;

    // 5. Category-wise Spending Breakdown for Current Month
    const categoryTotals = {};
    currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Uncategorized';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
      });

    const categorySpending = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: monthlyExpenses > 0 ? Number(((amount / monthlyExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 6. 6-Month Income vs Expense History
    const monthlyComparison = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const ym = `${y}-${m}`;
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });

      const txInMonth = userTransactions.filter((t) => t.date && t.date.startsWith(ym));
      const inc = txInMonth
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const exp = txInMonth
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      monthlyComparison.push({
        month: monthLabel,
        year: y,
        yearMonth: ym,
        income: inc,
        expenses: exp,
        savings: inc - exp,
      });
    }

    // 7. Recent Transactions (latest 7)
    const recentTransactions = [...userTransactions]
      .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
      .slice(0, 7);

    // 8. Spending Alerts for near-limit or exceeded budgets
    const budgetAlerts = [];
    activeBudgets.forEach((b) => {
      const catSpent = currentMonthTransactions
        .filter((t) => t.type === 'expense' && (t.category || '').toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const usage = b.monthlyLimit > 0 ? (catSpent / b.monthlyLimit) * 100 : 0;
      if (usage >= 100) {
        budgetAlerts.push({
          category: b.category,
          monthlyLimit: b.monthlyLimit,
          spent: catSpent,
          percentage: Number(usage.toFixed(0)),
          type: 'exceeded',
          message: `Exceeded budget limit by ${catSpent - b.monthlyLimit}`,
        });
      } else if (usage >= 85) {
        budgetAlerts.push({
          category: b.category,
          monthlyLimit: b.monthlyLimit,
          spent: catSpent,
          percentage: Number(usage.toFixed(0)),
          type: 'warning',
          message: `Approaching budget limit (${Number(usage.toFixed(0))}% used)`,
        });
      }
    });

    res.json({
      success: true,
      data: {
        currency: req.user.currency || 'INR',
        currencySymbol: req.user.currencySymbol || '₹',
        currentMonth: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        metrics: {
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          netSavings,
          savingsRate,
          totalBudgetLimit,
          budgetedSpending,
          budgetUsagePercent,
          transactionCount: userTransactions.length,
        },
        categorySpending,
        monthlyComparison,
        recentTransactions,
        budgetAlerts,
      },
    });
  } catch (err) {
    next(err);
  }
};


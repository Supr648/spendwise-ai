import { v4 as uuidv4 } from 'uuid';
import { readDB, saveDB } from '../db/database.js';

export const getBudgets = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const queryMonth = req.query.month ? parseInt(req.query.month, 10) : now.getMonth() + 1;
    const queryYear = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    const db = readDB();
    const userBudgets = db.budgets.filter(
      (b) => b.userId === userId && (!b.month || b.month === queryMonth) && (!b.year || b.year === queryYear)
    );

    const ymCurrent = `${queryYear}-${String(queryMonth).padStart(2, '0')}`;

    // Previous month parameters for comparison
    const prevDate = new Date(queryYear, queryMonth - 2, 1);
    const prevMonth = prevDate.getMonth() + 1;
    const prevYear = prevDate.getFullYear();
    const ymPrev = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

    const currentMonthExpenses = db.transactions.filter(
      (t) => t.userId === userId && t.type === 'expense' && t.date && t.date.startsWith(ymCurrent)
    );

    const prevMonthExpenses = db.transactions.filter(
      (t) => t.userId === userId && t.type === 'expense' && t.date && t.date.startsWith(ymPrev)
    );

    const budgetStatus = userBudgets.map((b) => {
      const spentCurrent = currentMonthExpenses
        .filter((t) => (t.category || '').toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const spentPrev = prevMonthExpenses
        .filter((t) => (t.category || '').toLowerCase() === b.category.toLowerCase())
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const remaining = Math.max(0, b.monthlyLimit - spentCurrent);
      const percentUsed = b.monthlyLimit > 0 ? Number(((spentCurrent / b.monthlyLimit) * 100).toFixed(1)) : 0;

      let status = 'good'; // 'good' | 'warning' | 'exceeded'
      if (percentUsed >= 100) status = 'exceeded';
      else if (percentUsed >= 85) status = 'warning';

      const changeFromPrev = spentPrev > 0
        ? Number((((spentCurrent - spentPrev) / spentPrev) * 100).toFixed(1))
        : null;

      return {
        id: b.id,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        spent: spentCurrent,
        remaining,
        percentUsed,
        status,
        spentPreviousMonth: spentPrev,
        changeFromPrevPercent: changeFromPrev,
        month: queryMonth,
        year: queryYear,
      };
    });

    const totalLimit = budgetStatus.reduce((sum, b) => sum + b.monthlyLimit, 0);
    const totalSpent = budgetStatus.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = Math.max(0, totalLimit - totalSpent);
    const totalPercent = totalLimit > 0 ? Number(((totalSpent / totalLimit) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      month: queryMonth,
      year: queryYear,
      currency: req.user.currency,
      currencySymbol: req.user.currencySymbol,
      summary: {
        totalLimit,
        totalSpent,
        totalRemaining,
        totalPercent,
        overBudgetCount: budgetStatus.filter((b) => b.status === 'exceeded').length,
        nearLimitCount: budgetStatus.filter((b) => b.status === 'warning').length,
      },
      budgets: budgetStatus,
    });
  } catch (err) {
    next(err);
  }
};

export const createBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, monthlyLimit, month, year } = req.body || {};

    if (!category || !monthlyLimit) {
      return res.status(400).json({ success: false, message: 'Category and monthly limit amount are required.' });
    }

    const numLimit = parseFloat(monthlyLimit);
    if (isNaN(numLimit) || numLimit <= 0) {
      return res.status(400).json({ success: false, message: 'Monthly limit must be a positive number.' });
    }

    const now = new Date();
    const bMonth = month ? parseInt(month, 10) : now.getMonth() + 1;
    const bYear = year ? parseInt(year, 10) : now.getFullYear();

    const db = readDB();

    // Check if category budget already exists for this month/year, if so update it
    const existingIdx = db.budgets.findIndex(
      (b) =>
        b.userId === userId &&
        b.category.toLowerCase() === category.trim().toLowerCase() &&
        b.month === bMonth &&
        b.year === bYear
    );

    if (existingIdx !== -1) {
      db.budgets[existingIdx].monthlyLimit = numLimit;
      db.budgets[existingIdx].updatedAt = new Date().toISOString();
      saveDB(db);
      return res.json({
        success: true,
        message: `Updated existing budget for ${category}.`,
        budget: db.budgets[existingIdx],
      });
    }

    const newBudget = {
      id: uuidv4(),
      userId,
      category: category.trim(),
      monthlyLimit: numLimit,
      month: bMonth,
      year: bYear,
      createdAt: new Date().toISOString(),
    };

    db.budgets.push(newBudget);
    saveDB(db);

    res.status(201).json({
      success: true,
      message: `Budget of ${req.user.currencySymbol || '₹'}${numLimit} created for ${category}.`,
      budget: newBudget,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = readDB();
    const idx = db.budgets.findIndex((b) => b.id === id && b.userId === userId);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Budget not found or access denied.' });
    }

    db.budgets.splice(idx, 1);
    saveDB(db);

    res.json({ success: true, message: 'Budget removed successfully.' });
  } catch (err) {
    next(err);
  }
};


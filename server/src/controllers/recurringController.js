import { v4 as uuidv4 } from 'uuid';
import { readDB, saveDB } from '../db/database.js';

export const getRecurring = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = readDB();

    const recurringList = db.recurringTransactions.filter((r) => r.userId === userId);

    // Compute reminders for items due within next 7 days
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const upcomingReminders = recurringList.filter(
      (r) => r.status === 'active' && r.nextDueDate && r.nextDueDate >= todayStr && r.nextDueDate <= sevenDaysLater
    );

    // Monthly commitments estimate (normalizes weekly/yearly items to a monthly figure)
    const toMonthlyAmount = (r) => {
      if (r.frequency === 'weekly') return Number(r.amount) * 4.33;
      if (r.frequency === 'yearly') return Number(r.amount) / 12;
      return Number(r.amount);
    };

    const monthlyCommittedExpenses = recurringList
      .filter((r) => r.status === 'active' && r.type === 'expense')
      .reduce((sum, r) => sum + toMonthlyAmount(r), 0);

    const monthlyCommittedIncome = recurringList
      .filter((r) => r.status === 'active' && r.type === 'income')
      .reduce((sum, r) => sum + toMonthlyAmount(r), 0);

    res.json({
      success: true,
      summary: {
        totalRecurringCount: recurringList.length,
        activeCount: recurringList.filter((r) => r.status === 'active').length,
        monthlyCommittedExpenses: Math.round(monthlyCommittedExpenses),
        monthlyCommittedIncome: Math.round(monthlyCommittedIncome),
        upcomingRemindersCount: upcomingReminders.length,
      },
      upcomingReminders,
      recurring: recurringList,
    });
  } catch (err) {
    next(err);
  }
};

export const createRecurring = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      amount,
      type = 'expense',
      category = 'Subscriptions',
      frequency = 'monthly',
      nextDueDate,
      autoAdd = true,
    } = req.body || {};

    if (!name || !amount) {
      return res.status(400).json({ success: false, message: 'Recurring item name and amount are required.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive amount is required.' });
    }

    const db = readDB();

    // Prevent duplicate recurring definition
    const existing = db.recurringTransactions.find(
      (r) => r.userId === userId && r.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Recurring item with name "${name}" already exists.`,
      });
    }

    const newRecurring = {
      id: uuidv4(),
      userId,
      name: name.trim(),
      amount: numAmount,
      type: type === 'income' ? 'income' : 'expense',
      category: category.trim(),
      frequency,
      nextDueDate: nextDueDate || new Date().toISOString().split('T')[0],
      status: 'active',
      autoAdd: Boolean(autoAdd),
      createdAt: new Date().toISOString(),
    };

    db.recurringTransactions.push(newRecurring);
    saveDB(db);

    res.status(201).json({
      success: true,
      message: `Recurring payment "${name}" added!`,
      recurring: newRecurring,
    });
  } catch (err) {
    next(err);
  }
};

export const toggleRecurringStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = readDB();
    const idx = db.recurringTransactions.findIndex((r) => r.id === id && r.userId === userId);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Recurring transaction not found or access denied.' });
    }

    const currentStatus = db.recurringTransactions[idx].status;
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    db.recurringTransactions[idx].status = newStatus;
    db.recurringTransactions[idx].updatedAt = new Date().toISOString();

    saveDB(db);

    res.json({
      success: true,
      message: `Recurring transaction is now ${newStatus}.`,
      recurring: db.recurringTransactions[idx],
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRecurring = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = readDB();
    const idx = db.recurringTransactions.findIndex((r) => r.id === id && r.userId === userId);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Recurring item not found or access denied.' });
    }

    db.recurringTransactions.splice(idx, 1);
    saveDB(db);

    res.json({ success: true, message: 'Recurring payment removed.' });
  } catch (err) {
    next(err);
  }
};


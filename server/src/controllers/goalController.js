import { v4 as uuidv4 } from 'uuid';
import { readDB, saveDB } from '../db/database.js';

export const getGoals = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const db = readDB();

    const userGoals = db.savingsGoals.filter((g) => g.userId === userId);
    const contributions = db.goalContributions.filter((c) => c.userId === userId);

    const goalsWithProgress = userGoals.map((g) => {
      const goalContribs = contributions
        .filter((c) => c.goalId === g.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const totalContributed = goalContribs.reduce((sum, c) => sum + Number(c.amount), 0);
      const currentAmount = Number(g.currentAmount) || totalContributed;
      const remainingAmount = Math.max(0, g.targetAmount - currentAmount);
      const progressPercent = g.targetAmount > 0
        ? Math.min(100, Number(((currentAmount / g.targetAmount) * 100).toFixed(1)))
        : 0;

      // Completion estimate based on monthly contribution velocity
      let estimatedCompletionDate = null;
      if (remainingAmount > 0 && goalContribs.length > 0) {
        // Average contribution rate
        const avgContrib = totalContributed / Math.max(1, goalContribs.length);
        if (avgContrib > 0) {
          const monthsRemaining = Math.ceil(remainingAmount / avgContrib);
          const estDate = new Date();
          estDate.setMonth(estDate.getMonth() + monthsRemaining);
          estimatedCompletionDate = estDate.toISOString().split('T')[0];
        }
      } else if (remainingAmount === 0) {
        estimatedCompletionDate = 'Completed! 🎉';
      }

      return {
        ...g,
        currentAmount,
        remainingAmount,
        progressPercent,
        estimatedCompletionDate,
        contributionsCount: goalContribs.length,
        recentContributions: goalContribs.slice(0, 3),
      };
    });

    const totalTarget = userGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
    const totalSaved = goalsWithProgress.reduce((sum, g) => sum + Number(g.currentAmount), 0);

    res.json({
      success: true,
      summary: {
        totalTarget,
        totalSaved,
        totalRemaining: Math.max(0, totalTarget - totalSaved),
        overallProgress: totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0,
        activeGoalsCount: userGoals.length,
      },
      goals: goalsWithProgress,
    });
  } catch (err) {
    next(err);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, targetAmount, targetDate, category = 'General', notes = '', initialAmount = 0 } = req.body || {};

    if (!name || !targetAmount) {
      return res.status(400).json({ success: false, message: 'Goal name and target amount are required.' });
    }

    const numTarget = parseFloat(targetAmount);
    const numInitial = parseFloat(initialAmount) || 0;

    if (isNaN(numTarget) || numTarget <= 0) {
      return res.status(400).json({ success: false, message: 'Target amount must be a positive number.' });
    }

    const db = readDB();
    const newGoalId = uuidv4();

    const newGoal = {
      id: newGoalId,
      userId,
      name: name.trim(),
      targetAmount: numTarget,
      currentAmount: numInitial,
      targetDate: targetDate || null,
      category: category.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.savingsGoals.push(newGoal);

    // If initial contribution provided
    if (numInitial > 0) {
      db.goalContributions.push({
        id: uuidv4(),
        userId,
        goalId: newGoalId,
        amount: numInitial,
        date: new Date().toISOString().split('T')[0],
        notes: 'Initial goal contribution',
        createdAt: new Date().toISOString(),
      });
    }

    saveDB(db);

    res.status(201).json({
      success: true,
      message: `Savings goal "${name}" created!`,
      goal: newGoal,
    });
  } catch (err) {
    next(err);
  }
};

export const addContribution = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, date = new Date().toISOString().split('T')[0], notes = '' } = req.body || {};

    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive contribution amount required.' });
    }

    const db = readDB();
    const goalIdx = db.savingsGoals.findIndex((g) => g.id === id && g.userId === userId);

    if (goalIdx === -1) {
      return res.status(404).json({ success: false, message: 'Savings goal not found or access denied.' });
    }

    const newContrib = {
      id: uuidv4(),
      userId,
      goalId: id,
      amount: numAmount,
      date,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    db.goalContributions.push(newContrib);
    db.savingsGoals[goalIdx].currentAmount = (Number(db.savingsGoals[goalIdx].currentAmount) || 0) + numAmount;
    db.savingsGoals[goalIdx].updatedAt = new Date().toISOString();

    saveDB(db);

    res.status(201).json({
      success: true,
      message: `Added contribution of ${req.user.currencySymbol || '₹'}${numAmount} to "${db.savingsGoals[goalIdx].name}".`,
      goal: db.savingsGoals[goalIdx],
      contribution: newContrib,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = readDB();
    const idx = db.savingsGoals.findIndex((g) => g.id === id && g.userId === userId);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Goal not found or access denied.' });
    }

    db.savingsGoals.splice(idx, 1);
    // Remove related contributions
    db.goalContributions = db.goalContributions.filter((c) => c.goalId !== id);
    saveDB(db);

    res.json({ success: true, message: 'Savings goal and contribution history deleted.' });
  } catch (err) {
    next(err);
  }
};


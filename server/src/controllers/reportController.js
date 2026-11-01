import { readDB } from '../db/database.js';

export const getFinancialReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;
    const targetYear = parseInt(year, 10);

    const db = readDB();
    const userTransactions = db.transactions.filter(
      (t) => t.userId === userId && t.date && t.date.startsWith(String(targetYear))
    );

    // 12-Month breakdown
    const monthlyBreakdown = [];
    let annualTotalIncome = 0;
    let annualTotalExpenses = 0;

    for (let m = 1; m <= 12; m++) {
      const monthStr = String(m).padStart(2, '0');
      const ym = `${targetYear}-${monthStr}`;
      const monthName = new Date(targetYear, m - 1, 1).toLocaleString('en-US', { month: 'short' });

      const txs = userTransactions.filter((t) => t.date.startsWith(ym));
      const income = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const netSavings = income - expenses;
      const savingsRate = income > 0 ? Number(((netSavings / income) * 100).toFixed(1)) : 0;

      annualTotalIncome += income;
      annualTotalExpenses += expenses;

      monthlyBreakdown.push({
        monthNumber: m,
        month: monthName,
        yearMonth: ym,
        income,
        expenses,
        netSavings,
        savingsRate,
        transactionCount: txs.length,
      });
    }

    // Category distribution for the year
    const categoryTotals = {};
    userTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = t.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
      });

    const categoryAnalysis = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total,
        percentage:
          annualTotalExpenses > 0
            ? Number(((total / annualTotalExpenses) * 100).toFixed(1))
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const annualNetSavings = annualTotalIncome - annualTotalExpenses;
    const annualSavingsRate =
      annualTotalIncome > 0
        ? Number(((annualNetSavings / annualTotalIncome) * 100).toFixed(1))
        : 0;

    res.json({
      success: true,
      year: targetYear,
      currency: req.user.currency,
      currencySymbol: req.user.currencySymbol,
      annualSummary: {
        totalIncome: annualTotalIncome,
        totalExpenses: annualTotalExpenses,
        netSavings: annualNetSavings,
        savingsRate: annualSavingsRate,
        totalTransactions: userTransactions.length,
      },
      monthlyBreakdown,
      categoryAnalysis,
    });
  } catch (err) {
    next(err);
  }
};


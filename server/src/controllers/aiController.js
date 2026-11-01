import axios from 'axios';
import { readDB } from '../db/database.js';

export const getAiInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { question } = req.body || {};
    const db = readDB();

    const userTransactions = db.transactions.filter((t) => t.userId === userId);
    const userBudgets = db.budgets.filter((b) => b.userId === userId);
    const userGoals = db.savingsGoals.filter((g) => g.userId === userId);

    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const curr = req.user.currencySymbol || '₹';

    const currentMonthExpenses = userTransactions.filter((t) => t.type === 'expense' && t.date.startsWith(currentYM));
    const currentMonthIncome = userTransactions.filter((t) => t.type === 'income' && t.date.startsWith(currentYM));

    const totalIncome = currentMonthIncome.reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = currentMonthExpenses.reduce((s, t) => s + Number(t.amount), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

    // Category breakdown
    const categoryTotals = {};
    currentMonthExpenses.forEach((t) => {
      const c = t.category || 'General';
      categoryTotals[c] = (categoryTotals[c] || 0) + Number(t.amount);
    });

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Overruns
    const overruns = [];
    userBudgets.forEach((b) => {
      const spent = categoryTotals[b.category] || 0;
      if (spent > b.monthlyLimit) {
        overruns.push({ category: b.category, limit: b.monthlyLimit, spent, over: spent - b.monthlyLimit });
      }
    });

    const geminiKey = process.env.GEMINI_API_KEY;

    // If Gemini key is set, attempt live Gemini model call
    if (geminiKey) {
      try {
        const financialContext = JSON.stringify({
          userCurrency: req.user.currency,
          currentMonth: currentYM,
          monthlyIncome: totalIncome,
          monthlyExpenses: totalExpenses,
          netSavings,
          savingsRate: `${savingsRate}%`,
          topSpendingCategories: topCategories.map(([cat, amt]) => ({ category: cat, amount: amt })),
          budgetOverruns: overruns,
          activeSavingsGoals: userGoals.map((g) => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })),
        });

        const promptText = question && question.trim()
          ? question.trim()
          : 'Summarize my spending patterns this month, highlight any budget overruns, and give 3 actionable recommendations to improve my savings rate.';

        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `You are SpendWise AI, an empathetic personal finance advisor and budget optimization expert.
Answer the user's inquiry based strictly on their actual personal financial figures below.
Do not invent transactions or figures. Be concise, actionable, and encouraging.

User Financial Context:
${financialContext}

User Question:
${promptText}`,
                  },
                ],
              },
            ],
          },
          { timeout: 12000 }
        );

        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return res.json({
            success: true,
            model: 'Gemini 1.5 Flash',
            isConfigured: true,
            insight: aiText,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to deterministic reasoning:', geminiErr.message);
      }
    }

    // Deterministic Financial Reasoning Advisor (Fallback when no key is configured)
    let groundedAdvice = '';
    const q = (question || '').toLowerCase();

    if (q.includes('budget') || q.includes('overrun')) {
      if (overruns.length > 0) {
        groundedAdvice = `### ⚠️ Budget Overrun Advisory\n\n` +
          `You have **${overruns.length} category over budget** this month:\n\n` +
          overruns.map((o) => `* **${o.category}:** Spent ${curr}${o.spent.toLocaleString()} vs limit of ${curr}${o.limit.toLocaleString()} (**+${curr}${o.over.toLocaleString()} over budget**)`).join('\n') +
          `\n\n**Actionable Suggestion:** Consider shifting temporary discretionary funds from less active categories, or re-allocating next month's cap to better align with your actual living patterns.`;
      } else {
        groundedAdvice = `### ✅ Healthy Budget Performance\n\nAll your spending categories are currently within your planned monthly limits! Total monthly expenses are tracking at **${curr}${totalExpenses.toLocaleString()}** against your planned allocations.`;
      }
    } else if (q.includes('saving') || q.includes('rate') || q.includes('goal')) {
      groundedAdvice = `### 💰 Savings Rate & Goals Analysis\n\n` +
        `* **Monthly Income:** ${curr}${totalIncome.toLocaleString()}\n` +
        `* **Monthly Expenses:** ${curr}${totalExpenses.toLocaleString()}\n` +
        `* **Net Savings:** **${curr}${netSavings.toLocaleString()}**\n` +
        `* **Current Savings Rate:** **${savingsRate}%** (Recommended benchmark is 20%+)\n\n` +
        `**Key Recommendations:**\n` +
        `1. Automate saving transfers on pay day rather than saving whatever is left at the end of the month.\n` +
        `2. Track recurring subscriptions (${curr}1,499/mo) to cancel any unused media accounts.`;
    } else {
      groundedAdvice = `### 💡 SpendWise Monthly Financial Health Summary\n\n` +
        `For **${now.toLocaleString('en-US', { month: 'long', year: 'numeric' })}**:\n\n` +
        `* **Total Earned:** ${curr}${totalIncome.toLocaleString()}\n` +
        `* **Total Spent:** ${curr}${totalExpenses.toLocaleString()}\n` +
        `* **Net Surplus:** ${curr}${netSavings.toLocaleString()} (${savingsRate}% savings rate)\n\n` +
        `**Top Spending Outlets:**\n` +
        topCategories.map(([cat, amt], i) => `${i + 1}. **${cat}:** ${curr}${amt.toLocaleString()} (${totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(0) : 0}% of all spending)`).join('\n') +
        `\n\n${overruns.length > 0 ? `⚠️ **Watchlist Alert:** ${overruns.map((o) => o.category).join(', ')} exceeded monthly budget limits.` : `✅ All budget categories are currently on track.`}`;
    }

    res.json({
      success: true,
      model: 'SpendWise Grounded Financial Engine',
      isConfigured: Boolean(geminiKey),
      insight: groundedAdvice,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};


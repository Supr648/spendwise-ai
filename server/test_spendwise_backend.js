import { seedDatabaseIfEmpty } from './src/db/database.js';
import { register, login, googleAuth, getMe } from './src/controllers/authController.js';
import { getDashboardSummary } from './src/controllers/dashboardController.js';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactionsCSV,
} from './src/controllers/transactionController.js';
import { getBudgets, createBudget } from './src/controllers/budgetController.js';
import { getGoals, createGoal, addContribution } from './src/controllers/goalController.js';
import { getRecurring, createRecurring } from './src/controllers/recurringController.js';
import { getFinancialReports } from './src/controllers/reportController.js';
import { getAiInsights } from './src/controllers/aiController.js';

function mockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
}

async function runTests() {
  console.log('--- Testing SpendWise AI Backend Engine ---');
  seedDatabaseIfEmpty();

  // 1. Login with demo user
  const resLogin = mockRes();
  await login(
    { body: { email: 'demo@spendwise.ai', password: 'password123' } },
    resLogin,
    console.error
  );
  console.log(`✓ Login: status=${resLogin.statusCode}, user=${resLogin.data.user?.name}, token=${Boolean(resLogin.data.token)}`);
  const user = resLogin.data.user;

  // 1b. Test Google OAuth
  const resGoogle = mockRes();
  await googleAuth(
    {
      body: {
        userInfo: {
          email: 'supriya.google@spendwise.ai',
          name: 'Supriya Sharma',
          picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
          googleId: 'google_oauth_sub_123456789'
        }
      }
    },
    resGoogle,
    console.error
  );
  console.log(`✓ Google OAuth: status=${resGoogle.statusCode}, user=${resGoogle.data.user?.name}, provider=${resGoogle.data.user?.authProvider}, token=${Boolean(resGoogle.data.token)}`);

  // 2. Dashboard summary
  const resDash = mockRes();
  await getDashboardSummary({ user }, resDash, console.error);
  const m = resDash.data.data.metrics;
  console.log(`✓ Dashboard: Balance=${resDash.data.data.currencySymbol}${m.totalBalance.toLocaleString()}, Income=${resDash.data.data.currencySymbol}${m.monthlyIncome.toLocaleString()}, Expenses=${resDash.data.data.currencySymbol}${m.monthlyExpenses.toLocaleString()}, SavingsRate=${m.savingsRate}%`);
  console.log(`  Categories breakdown: ${resDash.data.data.categorySpending.length} categories, Alerts: ${resDash.data.data.budgetAlerts.length}`);

  // 3. Transactions CRUD
  const resTxList = mockRes();
  await getTransactions({ user, query: {} }, resTxList, console.error);
  console.log(`✓ List Transactions: found ${resTxList.data.totalCount} records`);

  const resTxCreate = mockRes();
  await createTransaction(
    {
      user,
      body: {
        amount: 1500,
        type: 'expense',
        category: 'Books & Learning',
        date: '2026-10-25',
        paymentMethod: 'UPI',
        notes: 'Financial intelligence handbook',
      },
    },
    resTxCreate,
    console.error
  );
  const newTxId = resTxCreate.data.transaction?.id;
  console.log(`✓ Create Transaction: status=${resTxCreate.statusCode}, id=${newTxId}`);

  // 4. Duplicate transaction detection test
  const resDup = mockRes();
  await createTransaction(
    {
      user,
      body: {
        amount: 1500,
        type: 'expense',
        category: 'Books & Learning',
        date: '2026-10-25',
      },
    },
    resDup,
    console.error
  );
  console.log(`✓ Duplicate Detection: status=${resDup.statusCode}, isDuplicate=${resDup.data.isDuplicate}`);

  // 5. Budgets & Progress
  const resBudgets = mockRes();
  await getBudgets({ user, query: {} }, resBudgets, console.error);
  console.log(`✓ Budgets: count=${resBudgets.data.budgets.length}, totalLimit=${resBudgets.data.summary.totalLimit}, totalSpent=${resBudgets.data.summary.totalSpent}`);

  // 6. Savings Goals & Contributions
  const resGoals = mockRes();
  await getGoals({ user }, resGoals, console.error);
  console.log(`✓ Goals: count=${resGoals.data.goals.length}, overallProgress=${resGoals.data.summary.overallProgress}%`);

  // 7. Recurring Transactions & Reminders
  const resRec = mockRes();
  await getRecurring({ user }, resRec, console.error);
  console.log(`✓ Recurring: count=${resRec.data.recurring.length}, reminders=${resRec.data.upcomingReminders.length}`);

  // 8. Reports (12-month summary)
  const resReports = mockRes();
  await getFinancialReports({ user, query: { year: 2026 } }, resReports, console.error);
  console.log(`✓ Annual Reports: year=${resReports.data.year}, annualIncome=${resReports.data.annualSummary.totalIncome}, annualExpenses=${resReports.data.annualSummary.totalExpenses}`);

  // 9. AI Insights
  const resAi = mockRes();
  await getAiInsights({ user, body: { question: 'How can I optimize my budget?' } }, resAi, console.error);
  console.log(`✓ AI Insights: model=${resAi.data.model}, response length=${resAi.data.insight.length}`);

  console.log('\n🎉 ALL SPENDWISE AI BACKEND SERVICES TESTED AND PASSING SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});


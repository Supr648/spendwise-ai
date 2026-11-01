import http from 'http';
import { seedDatabaseIfEmpty } from './src/db/database.js';
import { register, login, googleAuth, getMe } from './src/controllers/authController.js';
import { getDashboardSummary } from './src/controllers/dashboardController.js';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
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

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw), raw });
        } catch {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runAllTests() {
  console.log('===============================================================');
  console.log('       SPENDWISE AI COMPREHENSIVE TEST SUITE EXECUTION         ');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, extra = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] ${title} ${extra ? '— ' + extra : ''}`);
    } else {
      console.error(`  [FAIL] ${title} ${extra ? '— ' + extra : ''}`);
    }
  }

  // --- SUITE A: UNIT & DATABASE ENGINE CONTROLLERS ---
  console.log('--- SUITE A: Core Financial Database & Controllers ---');
  seedDatabaseIfEmpty();

  // Test A1: Demo Login
  const resLogin = mockRes();
  await login({ body: { email: 'demo@spendwise.ai', password: 'password123' } }, resLogin, console.error);
  assert('A1: Password Login Controller', resLogin.statusCode === 200 && Boolean(resLogin.data.token), `User: ${resLogin.data.user?.name}`);
  const user = resLogin.data.user;

  // Test A2: Google OAuth Ingestion
  const resGoogle = mockRes();
  await googleAuth({
    body: {
      userInfo: {
        email: 'alex.oauth@gmail.com',
        name: 'Alex Morgan Google',
        picture: 'https://example.com/avatar.jpg',
        googleId: 'g_oauth_001',
      }
    }
  }, resGoogle, console.error);
  assert('A2: Google OAuth Ingestion & User Provisioning', resGoogle.statusCode === 200 && resGoogle.data.user?.authProvider === 'google');

  // Test A3: Dashboard Calculation
  const resDash = mockRes();
  await getDashboardSummary({ user }, resDash, console.error);
  const m = resDash.data.data.metrics;
  assert('A3: Real Balance & Savings Rate Calculations', typeof m.totalBalance === 'number' && m.savingsRate > 0, `Savings Rate: ${m.savingsRate}%`);

  // Test A4: Transaction Duplicate Shield
  const resDup = mockRes();
  await createTransaction({
    user,
    body: {
      amount: 4200,
      type: 'expense',
      category: 'Groceries',
      date: '2026-11-14',
    }
  }, resDup, console.error);
  assert('A4: Duplicate Transaction Prevention Shield', resDup.statusCode === 409 && resDup.data.isDuplicate === true);

  // Test A5: Budget Cap Tracking
  const resBudgets = mockRes();
  await getBudgets({ user, query: {} }, resBudgets, console.error);
  assert('A5: Category Budget Allocation & Alert Monitor', Array.isArray(resBudgets.data.budgets) && resBudgets.data.budgets.length > 0);

  // Test A6: Savings Goals Velocity
  const resGoals = mockRes();
  await getGoals({ user }, resGoals, console.error);
  assert('A6: Savings Goals Milestones & Forecasting', Array.isArray(resGoals.data.goals) && resGoals.data.summary.totalTarget > 0);

  // Test A7: Recurring Commitments
  const resRec = mockRes();
  await getRecurring({ user }, resRec, console.error);
  assert('A7: Subscriptions Ledger & Due Reminders', Array.isArray(resRec.data.recurring));

  // Test A8: 12-Month Performance Report
  const resRep = mockRes();
  await getFinancialReports({ user, query: { year: 2026 } }, resRep, console.error);
  assert('A8: 12-Month Annual Financial Performance', resRep.data.year === 2026 && Boolean(resRep.data.annualSummary));

  // Test A9: Grounded AI Advisor
  const resAi = mockRes();
  await getAiInsights({ user, body: { query: 'Analyze my grocery spending' } }, resAi, console.error);
  assert('A9: Grounded AI Financial Advisory Engine', resAi.statusCode === 200 && typeof resAi.data.insight === 'string');

  console.log('\n--- SUITE B: Live Server End-to-End HTTP API & SPA Routing ---');

  // Test B1: Root Route
  const root = await request('GET', '/');
  assert('B1: Production React Single Page App (GET /)', root.status === 200 && root.raw.includes('SpendWise AI'));

  // Test B2: Health Diagnostics
  const health = await request('GET', '/health');
  assert('B2: Live Health Diagnostics (GET /health)', health.status === 200 && health.body.status === 'operational', `Uptime: ${health.body.uptimeSeconds}s`);

  // Test B3: Live Token Authentication
  const liveLogin = await request('POST', '/api/auth/login', { email: 'demo@spendwise.ai', password: 'password123' });
  const liveToken = liveLogin.body.token;
  assert('B3: Live Token Authentication (POST /api/auth/login)', liveLogin.status === 200 && Boolean(liveToken));

  // Test B4: Live Google OAuth Authorization
  const liveGoogle = await request('POST', '/api/auth/google', {
    userInfo: { email: 'live.test@gmail.com', name: 'Live Tester', picture: 'https://example.com/p.jpg', googleId: 'g_live_1' }
  });
  assert('B4: Live Google OAuth Token Issuance (POST /api/auth/google)', liveGoogle.status === 200 && liveGoogle.body.user.authProvider === 'google');

  // Test B5: Live Currency Switcher
  const liveCurr = await request('PUT', '/api/auth/currency', { currency: 'INR' }, liveToken);
  assert('B5: Live Currency Preference Update (PUT /api/auth/currency)', liveCurr.status === 200 && liveCurr.body.currency === 'INR');

  // Test B6: Live Financial Ledger Summary
  const liveDash = await request('GET', '/api/dashboard/summary', null, liveToken);
  assert('B6: Live Dashboard Summary Calculation (GET /api/dashboard/summary)', liveDash.status === 200 && liveDash.body.data.currency === 'INR');

  // Test B7: Live Transaction CRUD Cycle
  const now = new Date().toISOString().split('T')[0];
  const uniqueAmount = 2000 + Math.floor(Math.random() * 7000);
  const postTx = await request('POST', '/api/transactions', {
    amount: uniqueAmount,
    type: 'expense',
    category: 'Dining Out',
    date: now,
    paymentMethod: 'UPI',
    notes: 'Comprehensive Test Suite Dinner ' + Date.now(),
  }, liveToken);
  const txId = postTx.body.transaction?.id;
  assert('B7: Live Transaction Creation (POST /api/transactions)', postTx.status === 201 && Boolean(txId), `ID: ${txId}`);

  // Test B8: Live Transaction Anti-Duplicate Shield
  const postDup = await request('POST', '/api/transactions', {
    amount: uniqueAmount,
    type: 'expense',
    category: 'Dining Out',
    date: now,
    paymentMethod: 'UPI',
    notes: 'Comprehensive Test Suite Dinner ' + Date.now(),
  }, liveToken);
  assert('B8: Live Duplicate Conflict Detection (409 Conflict)', postDup.status === 409 && postDup.body.isDuplicate === true);

  // Test B9: Live Transaction Cleanup
  const delTx = await request('DELETE', `/api/transactions/${txId}`, null, liveToken);
  assert('B9: Live Transaction Cleanup (DELETE /api/transactions/:id)', delTx.status === 200);

  // Test B10: Live Grounded AI Advisor
  const liveAi = await request('POST', '/api/ai/insights', { query: 'Where can I reduce expenses?' }, liveToken);
  assert('B10: Live Grounded AI Financial Advisor (POST /api/ai/insights)', liveAi.status === 200 && Boolean(liveAi.body.insight || liveAi.body.data?.insight));

  console.log('\n===============================================================');
  console.log(`   TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed} (${Math.round((passed / total) * 100)}% SUCCESS RATE)`);
  console.log('===============================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

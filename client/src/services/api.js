const API_BASE = '/api';

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem('spendwise_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

export const api = {
  // 1. Auth & Google OAuth APIs
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(name, email, password, currency = 'INR') {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, currency }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async googleAuth(payload) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Google authentication failed');
    return data;
  },

  async getGoogleConfig() {
    const res = await fetch(`${API_BASE}/auth/google-config`);
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user profile');
    return data;
  },

  async updateCurrency(currency) {
    const res = await fetch(`${API_BASE}/auth/currency`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currency }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update currency');
    return data;
  },

  // Accounts (Bank accounts & cash)
  async getAccounts() {
    const res = await fetch(`${API_BASE}/accounts`, { headers: getHeaders() });
    return res.json();
  },

  async createAccount(accountData) {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(accountData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create account');
    return data;
  },

  async deleteAccount(id) {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete account');
    return data;
  },

  // 2. Dashboard
  async getDashboardSummary() {
    const res = await fetch(`${API_BASE}/dashboard/summary`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch dashboard metrics');
    return data;
  },

  // 3. Transactions
  async getTransactions(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const res = await fetch(`${API_BASE}/transactions?${qs.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch transactions');
    return data;
  },

  async createTransaction(transactionData) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transactionData),
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to record transaction');
      err.isDuplicate = data.isDuplicate;
      throw err;
    }
    return data;
  },

  async updateTransaction(id, transactionData) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(transactionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update transaction');
    return data;
  },

  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete transaction');
    return data;
  },

  async importTransactionsCSV(csvText) {
    const res = await fetch(`${API_BASE}/transactions/import-csv`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ csvText }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'CSV import failed');
    return data;
  },

  // 4. Budgets
  async getBudgets(month, year) {
    const qs = new URLSearchParams();
    if (month) qs.append('month', month);
    if (year) qs.append('year', year);
    const res = await fetch(`${API_BASE}/budgets?${qs.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch budgets');
    return data;
  },

  async createBudget(budgetData) {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(budgetData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create budget');
    return data;
  },

  async deleteBudget(id) {
    const res = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete budget');
    return data;
  },

  // 5. Savings Goals
  async getGoals() {
    const res = await fetch(`${API_BASE}/goals`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch savings goals');
    return data;
  },

  async createGoal(goalData) {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(goalData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create goal');
    return data;
  },

  async addGoalContribution(goalId, contributionData) {
    const res = await fetch(`${API_BASE}/goals/${goalId}/contributions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(contributionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add contribution');
    return data;
  },

  async deleteGoal(id) {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete goal');
    return data;
  },

  // 6. Recurring
  async getRecurring() {
    const res = await fetch(`${API_BASE}/recurring`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch recurring items');
    return data;
  },

  async createRecurring(recurringData) {
    const res = await fetch(`${API_BASE}/recurring`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(recurringData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create recurring payment');
    return data;
  },

  async toggleRecurring(id) {
    const res = await fetch(`${API_BASE}/recurring/${id}/toggle`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update recurring status');
    return data;
  },

  async deleteRecurring(id) {
    const res = await fetch(`${API_BASE}/recurring/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete recurring item');
    return data;
  },

  // 7. Reports
  async getReports(year) {
    const qs = new URLSearchParams();
    if (year) qs.append('year', year);
    const res = await fetch(`${API_BASE}/reports?${qs.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch financial reports');
    return data;
  },

  // 8. AI Insights
  async getAiInsights(question) {
    const res = await fetch(`${API_BASE}/ai/insights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to generate AI insights');
    return data;
  },
};

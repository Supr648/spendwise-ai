import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'spendwise_db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial Database Structure
const initialData = {
  users: [],
  accounts: [],
  transactions: [],
  budgets: [],
  savingsGoals: [],
  goalContributions: [],
  recurringTransactions: [],
};

// Safe atomic read & write
export const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    saveDB(initialData);
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database file, recovering with empty schema:', err.message);
    return initialData;
  }
};

export const saveDB = (data) => {
  const tempFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, DB_FILE);
};

// Seed initial Demo User with realistic personal finance data if empty
export const seedDatabaseIfEmpty = () => {
  const db = readDB();
  if (db.users && db.users.length > 0) return;

  console.log('🌱 Seeding initial SpendWise AI demo user & personal finance records...');
  const demoUserId = 'usr_demo_001';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  const demoUser = {
    id: demoUserId,
    name: 'Alex Morgan',
    email: 'demo@spendwise.ai',
    passwordHash,
    currency: 'INR',
    currencySymbol: '₹',
    createdAt: new Date('2026-09-01').toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const checkingAccId = 'acc_chk_001';
  const savingsAccId = 'acc_sav_001';

  const accounts = [
    {
      id: checkingAccId,
      userId: demoUserId,
      name: 'Primary Checking (HDFC)',
      type: 'Checking',
      balance: 68500,
      currency: 'INR',
      createdAt: new Date('2026-09-01').toISOString(),
    },
    {
      id: savingsAccId,
      userId: demoUserId,
      name: 'Emergency Savings (SBI)',
      type: 'Savings',
      balance: 150000,
      currency: 'INR',
      createdAt: new Date('2026-09-01').toISOString(),
    },
  ];

  // Helper date for current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const ym = `${currentYear}-${currentMonth}`;

  // Transactions (income & expenses for current & prior month)
  const transactions = [
    // Current Month Income
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'income',
      amount: 85000,
      category: 'Salary',
      date: `${ym}-01`,
      paymentMethod: 'Bank Transfer',
      notes: 'Monthly corporate salary deposit',
      createdAt: new Date(`${ym}-01T09:00:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'income',
      amount: 12500,
      category: 'Freelance',
      date: `${ym}-10`,
      paymentMethod: 'UPI',
      notes: 'Consulting client project milestone',
      createdAt: new Date(`${ym}-10T14:30:00Z`).toISOString(),
    },
    // Current Month Expenses
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 24000,
      category: 'Rent & Housing',
      date: `${ym}-02`,
      paymentMethod: 'Net Banking',
      notes: 'Monthly apartment rent payment',
      createdAt: new Date(`${ym}-02T10:00:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 6800,
      category: 'Groceries',
      date: `${ym}-04`,
      paymentMethod: 'Credit Card',
      notes: 'Nature Basket bi-weekly groceries',
      createdAt: new Date(`${ym}-04T18:15:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 4200,
      category: 'Groceries',
      date: `${ym}-14`,
      paymentMethod: 'UPI',
      notes: 'Supermarket supplies and staples',
      createdAt: new Date(`${ym}-14T19:00:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 3200,
      category: 'Utilities',
      date: `${ym}-06`,
      paymentMethod: 'UPI',
      notes: 'Electricity and fiber broadband bill',
      createdAt: new Date(`${ym}-06T11:20:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 4500,
      category: 'Dining Out',
      date: `${ym}-08`,
      paymentMethod: 'Credit Card',
      notes: 'Weekend dinner with team',
      createdAt: new Date(`${ym}-08T21:30:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 2800,
      category: 'Dining Out',
      date: `${ym}-16`,
      paymentMethod: 'UPI',
      notes: 'Family brunch',
      createdAt: new Date(`${ym}-16T13:45:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 3500,
      category: 'Transportation',
      date: `${ym}-12`,
      paymentMethod: 'Credit Card',
      notes: 'Fuel refill and toll charges',
      createdAt: new Date(`${ym}-12T17:10:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 1499,
      category: 'Subscriptions',
      date: `${ym}-05`,
      paymentMethod: 'Auto Debit',
      notes: 'Netflix, Spotify & cloud storage',
      createdAt: new Date(`${ym}-05T08:00:00Z`).toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      accountId: checkingAccId,
      type: 'expense',
      amount: 2200,
      category: 'Healthcare',
      date: `${ym}-15`,
      paymentMethod: 'UPI',
      notes: 'Annual health checkup and vitamins',
      createdAt: new Date(`${ym}-15T15:00:00Z`).toISOString(),
    },
  ];

  // Monthly Budgets (month: null applies as ongoing default monthly budget)
  const budgets = [
    {
      id: uuidv4(),
      userId: demoUserId,
      category: 'Rent & Housing',
      monthlyLimit: 25000,
      month: null,
      year: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      category: 'Groceries',
      monthlyLimit: 14000,
      month: null,
      year: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      category: 'Dining Out',
      monthlyLimit: 8000,
      month: null,
      year: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      category: 'Transportation',
      monthlyLimit: 6000,
      month: null,
      year: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      category: 'Utilities',
      monthlyLimit: 4000,
      month: null,
      year: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      category: 'Subscriptions',
      monthlyLimit: 2000,
      month: null,
      year: null,
      createdAt: new Date().toISOString(),
    },
  ];

  // Savings Goals
  const goal1Id = uuidv4();
  const goal2Id = uuidv4();

  const savingsGoals = [
    {
      id: goal1Id,
      userId: demoUserId,
      name: '6-Month Emergency Fund',
      targetAmount: 300000,
      currentAmount: 180000,
      targetDate: `${currentYear + 1}-03-31`,
      category: 'Emergency',
      notes: 'High-priority liquid safety reserve',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: goal2Id,
      userId: demoUserId,
      name: 'Europe Holiday Vacation',
      targetAmount: 150000,
      currentAmount: 65000,
      targetDate: `${currentYear + 1}-06-30`,
      category: 'Travel',
      notes: 'Flights and accommodation savings',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const goalContributions = [
    {
      id: uuidv4(),
      userId: demoUserId,
      goalId: goal1Id,
      amount: 15000,
      date: `${ym}-05`,
      notes: 'Monthly emergency fund deposit',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      goalId: goal2Id,
      amount: 10000,
      date: `${ym}-07`,
      notes: 'Vacation savings deposit',
      createdAt: new Date().toISOString(),
    },
  ];

  // Recurring Transactions
  const recurringTransactions = [
    {
      id: uuidv4(),
      userId: demoUserId,
      type: 'expense',
      name: 'Apartment Rent',
      amount: 24000,
      category: 'Rent & Housing',
      frequency: 'monthly',
      nextDueDate: `${currentYear}-${String(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2).padStart(2, '0')}-02`,
      status: 'active',
      autoAdd: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      type: 'expense',
      name: 'Netflix & Media Subscriptions',
      amount: 1499,
      category: 'Subscriptions',
      frequency: 'monthly',
      nextDueDate: `${currentYear}-${String(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2).padStart(2, '0')}-05`,
      status: 'active',
      autoAdd: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      userId: demoUserId,
      type: 'income',
      name: 'Monthly Corporate Salary',
      amount: 85000,
      category: 'Salary',
      frequency: 'monthly',
      nextDueDate: `${currentYear}-${String(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2).padStart(2, '0')}-01`,
      status: 'active',
      autoAdd: true,
      createdAt: new Date().toISOString(),
    },
  ];

  saveDB({
    users: [demoUser],
    accounts,
    transactions,
    budgets,
    savingsGoals,
    goalContributions,
    recurringTransactions,
  });

  console.log('✓ SpendWise AI database initialized with demo records.');
};


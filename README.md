# SpendWise AI – Personal Finance Tracker

> **“Take Control of Your Money.”**

SpendWise AI is an institutional-grade, full-stack personal financial intelligence platform. It provides end-to-end income and expense tracking, category budgeting with automated overrun alerts, milestone savings goals with velocity forecasting, recurring bill tracking with 7-day payment reminders, annual multi-month cash flow reports, Google OAuth 2.0 authentication, Day & Night mode, and grounded AI-driven spending advice powered by Google Gemini.

---

## 🌟 Core Features

### 1. Real-Time Financial Dashboard
- **Liquid Balance & Cash Flow:** Accurately aggregates total balance across all user checking and savings accounts.
- **Dynamic Calculation:** Monthly income, monthly expenses, net savings, and savings rate percentage calculated dynamically from authenticated transaction records.
- **Visual Analytics:**
  - **6-Month Cash Flow Bar Chart:** Income vs. Expense comparison across consecutive calendar months with dynamic light/dark theme adaptation.
  - **Category Spending Breakdown:** Ranked category spending distribution with percentage indicators.
- **Recent Activity Ledger:** Chronological feed of latest deposits, UPI payments, card purchases, and bank transfers.
- **Smart Budget Alerts:** Early-warning banners when category spending reaches $\ge 85\%$ or exceeds planned limits.

### 2. Full-Featured Transaction Management
- **CRUD Operations:** Create, read, update, and delete income and expense transactions.
- **Attributes:** Amount, category, transaction date, payment method (UPI, Credit Card, Debit Card, Net Banking, Cash, Bank Transfer), and user notes.
- **Filter Toolbar:** Instant multi-parameter filtering by search keyword, category, type (Income only vs. Expense only), and custom start/end date ranges.
- **Duplicate Detection:** Automatic verification engine flagging identical transaction amounts, dates, and categories to prevent accidental double-billing (409 Conflict).
- **CSV Import & Export:** One-click CSV export and drag-and-drop / raw CSV text ingestion with automated duplicate filtering.

### 3. Category Budgets & Overrun Protection
- **Monthly Limits:** Set category spending caps for Rent, Groceries, Dining Out, Utilities, Transportation, Subscriptions, Healthcare, and Shopping.
- **Progress Tracking:** Real-time visual progress bars displaying amount spent, remaining budget buffer, and percentage consumed.
- **Near-Limit & Exceeded Alerts:** Color-coded alert badges:
  - *Within Limit:* Green indicator (<85%)
  - *Near-Limit Warning:* Amber warning badge (85%–99%)
  - *Exceeded Limit:* Red critical alert with exact overspend delta
- **Previous Month Comparison:** Percentage variance tracking spending against the prior calendar month.

### 4. Savings Goals & Milestone Velocity Forecasting
- **Goal Creation:** Define goal title, target amount, target date, category, and notes.
- **Contribution Ledger:** Record one-off deposits and recurring transfers to goals.
- **Velocity Forecasting:** Projects estimated goal completion dates based on historical contribution frequency and average velocity.
- **Overall Funding Pool:** Aggregates total target amount, total saved, and overall progress percentage.

### 5. Recurring Payments & Subscriptions
- **Fixed Commitments:** Manage salaries, apartment rent, streaming subscriptions, and utility bills.
- **Cadence & Status:** Supports weekly, monthly, and yearly recurring intervals with quick Active / Paused toggles.
- **Upcoming Payment Due Reminders:** Identifies and displays payments due within the next 7 days.
- **Commitment Quantification:** Computes total monthly fixed overhead.

### 6. 12-Month Financial Performance Reports
- **Annual Breakdown Table:** 12-month schedule of income, expenses, net savings, savings rate, and transaction frequency.
- **Inflow vs. Outflow Trajectory:** Multi-month bar chart visualising annual cash flow trends.
- **Annual Category Share:** Aggregated category expenses and percentage of total yearly spending.
- **Export Options:** Download complete annual ledger as CSV or generate high-resolution print/PDF reports.

### 7. Google OAuth 2.0 & Day/Night Mode
- **Google OAuth Sign-In:** 1-Click "Continue with Google" with automatic profile provisioning, avatar sync, and 30-day JWT issuance.
- **Day & Night Mode:** Tactile Sun/Moon switcher with smooth transitions and OS preference detection (`localStorage.spendwise_theme`).

### 8. AI Spending Insights & Financial Advisor
- **Gemini 1.5 Flash Integration:** Analyzes authenticated personal transaction records, category distributions, and budget overruns.
- **Grounded Advisor Mode:** If Gemini API credentials are unconfigured, runs the deterministic financial reasoning advisor with zero latency.

---

## 🏗️ Architecture & File Structure

```
spendwise-ai/
├── client/                      # React 18 SPA + Vite + Tailwind CSS + Recharts + Lucide
│   ├── src/
│   │   ├── components/          # Navbar, Dashboard, Transactions, Budgets, Goals, Reports, AI, Modals
│   │   ├── context/             # ThemeContext, AuthContext, FinanceContext
│   │   ├── services/api.js      # REST API client
│   │   └── App.jsx
│   ├── dist/                    # Compiled production assets
│   └── package.json
│
├── server/                      # Express.js REST API Engine
│   ├── src/
│   │   ├── controllers/         # Auth, Dashboard, Transactions, Budgets, Goals, Recurring, Reports, AI
│   │   ├── db/database.js       # Atomic file-backed JSON database
│   │   ├── middleware/          # JWT authMiddleware
│   │   ├── routes/              # Express API router
│   │   └── server.js            # Express server (serves REST API & client SPA)
│   ├── test_all.js              # Comprehensive 19-point automated test suite
│   └── package.json
│
├── Dockerfile                   # Multi-stage production container build
├── docker-compose.yml           # Turnkey orchestration with volume persistence
├── .env.example                 # Environment variable template
├── .gitignore                   # Production repository hygiene
└── package.json                 # Monorepo build, start, and test scripts
```

---

## 🚀 Production Deployment Guide

SpendWise AI is completely production-ready and can be deployed in minutes on any modern cloud hosting service.

### Option 1: One-Click Docker / Docker Compose (Recommended for Any VPS)
```bash
# Clone the repository
git clone <your-repo-url>
cd spendwise-ai

# Start containerized application with persistent data volume
docker compose up -d --build
```
Your application will be live at `http://your-server-ip:5001`.

### Option 2: Render / Railway / Fly.io (Zero-Config PaaS)
1. Push your repository to **GitHub** or **GitLab**.
2. Connect your repo to **Render** or **Railway** as a **Web Service**.
3. Configure the build and start commands:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. Set Environment Variables in your dashboard:
   - `NODE_ENV=production`
   - `JWT_SECRET=<generate-any-secure-random-string>`
   - `PORT=5001` (or let the platform assign it automatically)
   - *(Optional)* `GOOGLE_CLIENT_ID=<your-id>`
   - *(Optional)* `GEMINI_API_KEY=<your-key>`

### Option 3: Traditional Linux VPS (Ubuntu / Debian + Nginx + PM2)
```bash
# Install Node.js 20+ and PM2
sudo npm install -g pm2

# Install dependencies and build client
npm run install:all
npm run build

# Start with PM2 process manager
pm2 start server/src/server.js --name "spendwise-ai"
pm2 save
pm2 startup
```

---

## 🚦 Verification & Testing

Run the full 19-point automated test suite across all controllers, database operations, and live HTTP API routes:

```bash
npm test
```

### Default Demo Credentials
- **Email:** `demo@spendwise.ai`
- **Password:** `password123`
*(Auto-logged in by default on first load with 1-click Google sign-in also available)*

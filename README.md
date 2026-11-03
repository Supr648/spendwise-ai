# SpendWise AI – Personal Finance Tracker

<div align="center">

![SpendWise AI Banner](https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&auto=format&fit=crop&q=80)

# 💰 SpendWise AI
### *Take Control of Your Money.*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-brightgreen.svg)](https://github.com/Supr648/spendwise-ai)
[![Status](https://img.shields.io/badge/Deployment-Live-success.svg)](https://spendwise-ai-czgd.onrender.com)

**SpendWise AI** is an institutional-grade, full-stack personal finance tracker designed to replace clunky spreadsheets and expensive subscription apps. It features real-time liquid balance aggregation, intelligent category budgets with overrun alerts, savings goal milestone forecasting, recurring bill management with 7-day payment reminders, multi-currency support, Google OAuth 2.0 authentication, Day & Night mode, and grounded AI-driven spending advice.

[Explore Features](#-key-features) • [Quick Start](#-quick-start) • [Live Demo](#-live-deployment) • [API Reference](#-api-documentation) • [Docker](#-docker-deployment)

</div>

---

## 🌐 Live Deployment

- 🚀 **Live Production Application:** **[https://spendwise-ai-czgd.onrender.com](https://spendwise-ai-czgd.onrender.com)**
- 🩺 **System Diagnostics & Health:** **[https://spendwise-ai-czgd.onrender.com/health](https://spendwise-ai-czgd.onrender.com/health)**

> **Demo Access:** 1-Click login available on initial load as **Alex Morgan** (`demo@spendwise.ai`), or sign in instantly with **Continue with Google**.
>
> **Hosting notes:** The app runs on Render's free web-service plan. Free instances spin down after periods of inactivity, so the first request after idling can take ~50 seconds. The free plan also uses ephemeral storage — the seeded demo data is restored on each deploy/restart. Attach a Render Disk (paid plan) for durable storage.

---

## ✨ Key Features

### 1. 📊 Executive Financial Dashboard
- **Liquid Balance & Cash Flow:** Accurately calculates total available balance across all cash, bank, and checking accounts.
- **Dynamic Savings Rate:** Inflow, outflow, net savings, and savings rate percentage calculated dynamically from authenticated transaction records.
- **6-Month Cash Flow Chart:** Multi-month bar chart comparing inflows against expenditures with theme-adaptive axes and tooltips.
- **Category Spending Distribution:** Visual percentage breakdown of top expense outlets with category color tags.
- **Near-Limit & Overrun Badges:** Instant alerts when category spending reaches $\ge 85\%$ or exceeds allocated monthly limits.

### 2. 💳 Transaction Ledger & Protection
- **Full CRUD Support:** Add, edit, delete, and inspect transactions with amounts, categories, dates, payment methods, and notes.
- **Multi-Parameter Search:** Real-time search by merchant/note, category, type (Income only vs. Expense only), and custom date ranges.
- **🛡️ Anti-Duplicate Collision Detection:** Server-side validation engine detecting identical amounts, categories, and dates to prevent accidental double-billing (409 Conflict).
- **CSV Data Ingestion & Export:** 1-Click CSV export and raw CSV text importer with automated duplicate filtration.

### 3. 🎯 Smart Category Budgets
- **Monthly Spending Caps:** Set limits for Groceries, Dining Out, Rent & Housing, Utilities, Subscriptions, Healthcare, and Shopping.
- **Dynamic Progress Bars:** Color-shifting progress bars (Green $\to$ Amber $\to$ Rose) indicating exact percentage consumed.
- **Month-over-Month Variance:** Tracks percentage variance against the previous calendar month.

### 4. 🏆 Savings Goals & Milestone Velocity
- **Target Tracking:** Track emergency reserves, travel vacations, vehicle downpayments, and tech upgrades.
- **Contribution Ledger:** Record one-off deposits and automated monthly milestone allocations.
- **Velocity Forecasting:** Calculates estimated completion months based on contribution velocity and frequency.

### 5. 🔁 Recurring Subscriptions & Cash Flows
- **Fixed Commitments:** Manage recurring salaries, apartment rents, OTT streaming plans, and electricity bills.
- **Status Controls:** Active vs. Paused status toggles for seasonal subscriptions.
- **7-Day Payment Due Reminders:** Proactively alerts users to bills renewing within the upcoming week.

### 6. 📈 12-Month Annual Financial Performance
- **Annual Audit Schedule:** 12-month table recording monthly inflow, outflow, net savings, savings rate, and volume.
- **Export Capabilities:** Download comprehensive annual ledgers as CSV or export clean printable PDF reports.

### 7. 🔐 Google OAuth 2.0 & Custom Preferences
- **1-Click Google Sign-In:** Authenticate with Google identity, automatically provisioning profiles and linking Google avatars.
- **Multi-Currency Engine:** Defaults to **INR (₹)** with instant switching between **USD ($)**, **EUR (€)**, and **GBP (£)**.
- **Day & Night Mode:** Tactile Sun/Moon switcher with smooth cubic-bezier transitions and OS system preference sync (`localStorage`).

### 8. 🤖 Grounded AI Financial Advisor
- **Personalized Insights:** Evaluates actual user-recorded transactions and budget overruns to generate grounded financial advice.
- **Gemini 1.5 Flash Support:** Integrates Google Gemini with automatic fallback to the deterministic offline SpendWise reasoning engine.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend SPA** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend REST Engine** | Node.js (ESM), Express.js, JWT, bcryptjs, UUID |
| **Database** | Atomic file-backed JSON store with user isolation |
| **Authentication** | Google OAuth 2.0 (`googleAuth`) + Stateless JWT (30-day expiration) |
| **AI Engine** | Google Gemini 1.5 Flash + Grounded Deterministic Advisor |
| **DevOps / Containers** | Docker (Multi-stage Alpine), Docker Compose, OpenSSH Tunnels |

```
spendwise-ai/
├── client/                      # React 18 Single Page Application
│   ├── src/
│   │   ├── components/          # Navbar, Dashboard, Transactions, Budgets, Goals, Reports, AI
│   │   ├── context/             # ThemeContext, AuthContext, FinanceContext
│   │   ├── services/api.js      # REST API interface
│   │   └── App.jsx              # Main layout & notification orchestrator
│   ├── dist/                    # Minified production build
│   └── package.json
│
├── server/                      # Express.js REST API Server
│   ├── src/
│   │   ├── controllers/         # Auth, Dashboard, Transactions, Budgets, Goals, Recurring, Reports, AI
│   │   ├── db/database.js       # Atomic file-backed JSON database engine
│   │   ├── middleware/          # JWT authentication middleware
│   │   ├── routes/              # Express API route definitions
│   │   └── server.js            # Express server (serves REST API & client SPA)
│   ├── test_all.js              # Complete 19-point automated test suite
│   └── package.json
│
├── Dockerfile                   # Production multi-stage container build
├── docker-compose.yml           # Turnkey container orchestration with volume storage
├── .env.example                 # Environment configuration template
└── package.json                 # Monorepo scripts
```

---

## 🚦 Quick Start

### Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/Supr648/spendwise-ai.git
cd spendwise-ai
```

### 2. Install Dependencies
```bash
# Installs both server and client dependencies
npm run install:all
```

### 3. Build Client & Start
```bash
# Build the production client bundle
npm run build

# Start the unified production server on port 5001
npm start
```

Visit **`http://localhost:5001`** in your browser.

---

## 🧪 Automated Testing

SpendWise AI includes a comprehensive 19-point automated test suite verifying both internal controllers and live HTTP API endpoints:

```bash
npm test
```

```
===============================================================
       SPENDWISE AI COMPREHENSIVE TEST SUITE EXECUTION         
===============================================================

--- SUITE A: Core Financial Database & Controllers ---
  [PASS] A1: Password Login Controller — User: Alex Morgan
  [PASS] A2: Google OAuth Ingestion & User Provisioning 
  [PASS] A3: Real Balance & Savings Rate Calculations — Savings Rate: 45.9%
  [PASS] A4: Duplicate Transaction Prevention Shield 
  [PASS] A5: Category Budget Allocation & Alert Monitor 
  [PASS] A6: Savings Goals Milestones & Forecasting 
  [PASS] A7: Subscriptions Ledger & Due Reminders 
  [PASS] A8: 12-Month Annual Financial Performance 
  [PASS] A9: Grounded AI Financial Advisory Engine 

--- SUITE B: Live Server End-to-End HTTP API & SPA Routing ---
  [PASS] B1: Production React Single Page App (GET /) 
  [PASS] B2: Live Health Diagnostics (GET /health) — Uptime: 1506s
  [PASS] B3: Live Token Authentication (POST /api/auth/login) 
  [PASS] B4: Live Google OAuth Token Issuance (POST /api/auth/google) 
  [PASS] B5: Live Currency Preference Update (PUT /api/auth/currency) 
  [PASS] B6: Live Dashboard Summary Calculation (GET /api/dashboard/summary) 
  [PASS] B7: Live Transaction Creation (POST /api/transactions)
  [PASS] B8: Live Duplicate Conflict Detection (409 Conflict) 
  [PASS] B9: Live Transaction Cleanup (DELETE /api/transactions/:id) 
  [PASS] B10: Live Grounded AI Financial Advisor (POST /api/ai/insights) 

===============================================================
   TOTAL TESTS: 19 | PASSED: 19 | FAILED: 0 (100% SUCCESS RATE)
===============================================================
```

---

## ☁️ Render Deployment

The repository ships a `render.yaml` Blueprint for [Render](https://render.com), which is how the live demo is hosted.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Supr648/spendwise-ai)

1. Open the link above (or **New → Blueprint** in the Render dashboard) and select this repository.
2. Apply the Blueprint — Render installs dependencies, builds the React client, and starts the Express server.
3. Optionally add `GOOGLE_CLIENT_ID` or `GEMINI_API_KEY` in **Environment** after the first deploy.

| Setting | Value |
| :--- | :--- |
| Runtime / Plan | Node / Free |
| Build command | `npm run install:all && npm run build` |
| Start command | `npm start` |
| Health check path | `/health` |
| Required env var | `JWT_SECRET` (auto-generated by the Blueprint) |

> **Persistence:** The file-backed JSON database lives on the service filesystem. On the free plan this storage is ephemeral and resets on deploy/restart. Attach a [Render Disk](https://render.com/docs/disks) (paid plan) and point the app at it for durable data.

---

## 🐳 Docker Deployment

Deploy in one command to any VPS, AWS ECS, GCP Cloud Run, or DigitalOcean:

```bash
# Build and run container in detached mode
docker compose up -d --build
```

The application automatically exposes port **5001** and attaches a persistent local volume (`spendwise_data`) for transaction storage.

---

## 📄 API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Sign in with email & password | No |
| `POST` | `/api/auth/google` | Google OAuth token verification & login | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile | Yes |
| `PUT` | `/api/auth/currency` | Update currency (`INR`, `USD`, `EUR`, `GBP`) | Yes |
| `GET` | `/api/dashboard/summary`| Aggregated metrics, cash flow & alerts | Yes |
| `GET` | `/api/transactions` | Search & filter transaction records | Yes |
| `POST` | `/api/transactions` | Record transaction (with duplicate check) | Yes |
| `PUT` | `/api/transactions/:id` | Update transaction record | Yes |
| `DELETE`| `/api/transactions/:id` | Remove transaction record | Yes |
| `GET` | `/api/budgets` | Fetch category spending caps & warnings | Yes |
| `POST` | `/api/budgets` | Set monthly category budget | Yes |
| `GET` | `/api/goals` | Milestones & completion forecasting | Yes |
| `POST` | `/api/goals/:id/contribute` | Deposit contribution towards goal | Yes |
| `GET` | `/api/recurring` | Subscriptions & 7-day payment reminders | Yes |
| `GET` | `/api/reports` | 12-Month cash flow annual schedule | Yes |
| `POST` | `/api/ai/insights` | Conversational financial spending advice | Yes |
| `GET` | `/health` | System diagnostics & uptime check | No |

---

## 🔒 Security & Privacy

- **Strict Multi-Tenant Isolation:** Users can never access or query transactions from other profiles. All database queries are scoped by `req.user.id`.
- **Zero Third-Party Data Sharing:** Financial ledger records remain private and are never monetized or fed into external ad models.
- **Cryptographic Storage:** Passwords hashed with bcrypt; JWT tokens signed with SHA-256 HMAC.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [Supriya Unde](https://github.com/Supr648).

# 🏦 MicroFinance Pro — Loan Management System

Production-ready Loan Management System built with Next.js 14, Prisma ORM, MySQL, JWT Auth.

---

## ⚡ Setup (5 Steps)

```bash
# 1. Install dependencies
npm install

# 2. Copy and configure .env
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET

# 3. Create MySQL database
mysql -u root -p -e "CREATE DATABASE loan_management_db;"

# 4. Push schema + generate client
npm run db:generate
npm run db:push
npm run db:seed, npx prisma db seed

# 5. Start dev server
npm run dev
```

Open → http://localhost:3000

---

## 🔑 Login Credentials

| Role      | Email                   | Password |
|-----------|-------------------------|----------|
| Admin     | admin@example.com       | 123456   |
| Sub Admin | subadmin@example.com    | 123456   |
| Agent 1   | agent1@example.com      | 123456   |
| Agent 2   | agent2@example.com      | 123456   |
| Agent 3   | agent3@example.com      | 123456   |

---

## ✅ Features

### Party Management
- Add/Edit/Delete parties with 6-tab form
- **ID Proof** (Aadhaar, PAN, Voter ID, Passport, Driving License)
- **Address Proof** (Electricity Bill, Ration Card, etc.)
- 2 Guarantors/References
- Bank details
- Agent assignment
- **Party Dashboard** — full view with loans, payments, all documents

### Loans
- 3 Types: Simple / Monthly Interest / Recurring Deposit
- Filter by: All / Simple / Monthly / Recurring + Status + **Agent**
- **Change Agent** anytime from loan details page
- Auto EMI schedule generation
- Late fine auto-calculation

### Payments & Collections
- Filter by **date range** and **agent**
- **Export Excel** with filters
- Print thermal receipt (80mm)
- Daily collection sheet

### Reports (All with Agent Filter)
- Collection Report → filter by date + agent
- Loan Report → filter by type + agent
- Overdue Report → filter by agent
- Excel export for all reports

### Agents
- **Add / Edit / Delete** agents
- Enable / Disable login
- Monthly collection stats

### Documents (All Printable)
- 📒 **Loan Passbook** — full EMI + payment history
- 📄 **Loan Agreement** — legal document
- 📋 **NOC Certificate** — No Objection Certificate
- ✅ **Closure Certificate** — with LOAN CLOSED watermark
- 🖨️ **Payment Receipt** — thermal print ready

### Notifications
- 📧 Email reminder via SMTP
- 📱 SMS reminder via TextLocal API
- Send Both option
- Available from Party Dashboard + Admin + Agent views

### Download Payment Reports
- Party-wise payment export (Excel)
- Date filter + Agent filter
- Available from party dashboard and payments page

---

## 📡 API Endpoints

```
POST /api/auth/login
POST /api/auth/logout

GET  /api/parties?search=&agentId=&page=
POST /api/parties
GET  /api/parties/:id
PUT  /api/parties/:id
DELETE /api/parties/:id
POST /api/parties/:id/reminder        { type: "email"|"sms"|"both" }

GET  /api/loans?loanType=&status=&agentId=&page=
POST /api/loans
GET  /api/loans/:id
PATCH /api/loans/:id
DELETE /api/loans/:id                 (closes loan)
PATCH /api/loans/:id/agent            { agentId }
GET  /api/loans/:id/passbook          (HTML passbook)

GET  /api/payments?startDate=&endDate=&agentId=&page=
POST /api/payments
GET  /api/payments/:id/receipt        (HTML receipt)

GET  /api/dashboard
GET  /api/reports?type=collection|loans|overdue|party_payments&agentId=&format=excel
GET  /api/agents
POST /api/agents
PUT  /api/agents                      { id, name, email, phone, password }
PATCH /api/agents                     { id, isActive }
DELETE /api/agents?id=

GET  /api/documents/agreement/:loanId
GET  /api/documents/noc/:loanId
GET  /api/documents/closure/:loanId

GET  /api/settings
POST /api/settings
```

---

## 🗄️ Database Tables

| Table             | Purpose                    |
|-------------------|----------------------------|
| users             | Admin, Sub Admin, Agents   |
| parties           | Customers with KYC docs    |
| loans             | All 3 loan types           |
| loan_installments | EMI schedule               |
| payments          | Transactions + receipts    |
| audit_logs        | System activity log        |
| system_settings   | Company config             |

---

## 🔧 Production Build

```bash
npm run build
npm start
```

### Production .env
```env
DATABASE_URL="mysql://user:pass@host:3306/loan_db"
JWT_SECRET="64-char-random-string"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="company@gmail.com"
SMTP_PASS="gmail-app-password"
SMS_API_KEY="textlocal-api-key"
NODE_ENV="production"
```

---

MIT License

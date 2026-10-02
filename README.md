# StudySpace OS — Study Library Operating System 🚀
> **Enterprise Multi-Tenant B2B SaaS Platform for Modern Study Libraries & Reading Rooms**
> 
> Web • Tablet • Mobile Responsive • Progressive Web App (PWA) • Super Admin Command Center • Student Self-Service Portal

---

## 🌟 Key Platform Modules & Architecture

```
                                  ┌───────────────────────────┐
                                  │   Super Admin Command     │
                                  │   Center (/super-admin)   │
                                  │   (MRR, Quotas, B2B SaaS) │
                                  └─────────────┬─────────────┘
                                                │
         ┌──────────────────────────────────────┴──────────────────────────────────────┐
         │                                                                             │
┌────────▼────────────────────┐                                             ┌──────────▼──────────────────┐
│ Library Owner / Admin Panel │                                             │ Student Self-Service Portal │
│ (/dashboard)                │                                             │ (/portal)                   │
├─────────────────────────────┤                                             ├─────────────────────────────┤
│ 🪑 Seat Grid & Shift Matrix │                                             │ 🪪 Digital Smart PVC ID Card│
│ ⏱️ Live Attendance Check-In │                                             │ ⏳ Desk & Shift Validity    │
│ 🔔 Expiry Alerts & WhatsApp │                                             │ 📊 30-Day Study Habit Log   │
│ 💳 Razorpay Online Gateway  │                                             │ ⚡ 1-Click Direct UPI Pay   │
│ 📊 Profit & Loss (P&L)      │                                             │ 📲 Installable Mobile PWA   │
└────────┬────────────────────┘                                             └──────────┬──────────────────┘
         │                                                                             │
         └──────────────────────────────────────┬──────────────────────────────────────┘
                                                │
                                  ┌─────────────▼─────────────┐
                                  │  Express + Node.js API    │
                                  │  (JWT, RBAC, Cron Workers)│
                                  └─────────────┬─────────────┘
                                                │
                                  ┌─────────────▼─────────────┐
                                  │    MongoDB Database       │
                                  └───────────────────────────┘
```

---

## 🚀 Core Feature Highlights

### 1. 👑 Super Admin SaaS Platform (`/super-admin`)
- **Platform Analytics**: Total Managed Libraries, Active Subscriptions, Live Desks Count, MRR (Monthly Recurring Revenue), and GMV.
- **Tenant Control**: Instant plan tier upgrades (Free, Starter, Pro, Enterprise), seat quota overrides, and tenant suspension.
- **Support Impersonation**: 1-click **"Login as Owner"** session bridging for instant support without asking for passwords.

### 2. 📱 Progressive Web App (PWA) & Native Mobile Drawer
- Fully installable on iOS, Android, and Windows with offline caching (`sw.js` and `manifest.json`).
- Responsive sliding drawer for tablets and mobile devices with collapsible navigation.

### 3. 🪑 Visual Seat Matrix & Shift Overlap Engine
- Grid visualization of all desks (Ground floor, First floor, AC / Non-AC, Private Cubicles).
- Automatic collision detection prevent double-booking across Morning, Afternoon, Evening, and 24-Hour slots.

### 4. ⏱️ Live Real-Time Attendance & Hardware Scanner Listener
- One-click Check-In / Check-Out toggle with automatic focus hours calculator.
- Dedicated USB/Bluetooth barcode/QR scanner gun buffer support for touchless entry.

### 5. 🧑‍🎓 Student Self-Service Portal (`/portal`)
- Public student lookup by phone number or admission ID without needing complex credentials.
- Instant access to allocated desk number, shift validity countdown, and 30-day study habit tracking.
- Interactive digital PVC smart ID card generation with printable cardstock layout.
- 1-Click UPI direct renewal modal (GPay, PhonePe, Paytm).

### 6. 💳 Razorpay SaaS Checkout & Webhooks
- Automated monthly / annual plan checkout with dynamic plan pricing and instant subscription activation.

### 7. 📲 WhatsApp Template Customizer & Renewal Engine
- Dynamic variable placeholder tags (`{studentName}`, `{seatNumber}`, `{expiryDate}`, `{amount}`, `{libraryName}`, `{upiId}`).
- Live smartphone simulator preview with 1-click WhatsApp web/app delivery.

### 8. 📊 Daily Expenses & P&L Engine
- Categorized expense tracking (Rent, Electricity, WiFi, Maintenance, Staff Salary).
- Live Net Profit KPI formula: `(Total Inflow Payments) - (Total Outflow Expenses)`.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS v4, Vite, Lucide React, React Query, Recharts.
- **Backend**: Node.js 20, Express.js 5, Mongoose ODM, Razorpay SDK, JWT, Cookie-Parser, Helmet, Mongo Sanitize.
- **DevOps & Containers**: Docker, Docker Compose, Nginx Alpine.

---

## ⚡ Quick Start (Local Development)

### 1. Backend Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT Secret
npm run dev
```

### 2. Frontend Client
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Client runs at `http://localhost:5173`.

---

## 🐳 Production Deployment with Docker Compose

To launch the complete production stack (MongoDB, API server, and Nginx PWA client) in a single command:

```bash
docker-compose up -d --build
```

- **Client & PWA App**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:8000` (or `http://localhost/api/`)
- **Health Check**: `http://localhost/health`
- **Student Portal**: `http://localhost/portal`
- **Super Admin**: `http://localhost/super-admin`

---

## 📄 License
ISC License. Built for Study Library Operating System SaaS Owners.

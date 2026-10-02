# StudySpace OS — Study Library Operating System 🚀

[![Live App on Vercel](https://img.shields.io/badge/Vercel-Live%20Demo-black?style=for-the-badge&logo=vercel)](https://library-management-rust-rho.vercel.app/)
[![API on Render](https://img.shields.io/badge/Render-API%20Online-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://library-management-ok58.onrender.com/health)
[![React 19](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js 20](https://img.shields.io/badge/Node.js%2020-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

> **Enterprise Multi-Tenant B2B SaaS Platform & Real-Time Operating System for Study Libraries, Reading Halls & Co-working Spaces.**
>
> 🌐 **Live Web Application:** [https://library-management-rust-rho.vercel.app](https://library-management-rust-rho.vercel.app)  
> 🚀 **Live Backend API (Render):** [https://library-management-ok58.onrender.com](https://library-management-ok58.onrender.com)  
> 🧑‍🎓 **Student Self-Service Portal:** [https://library-management-rust-rho.vercel.app/portal](https://library-management-rust-rho.vercel.app/portal)  
> 👑 **Super Admin Command Center:** [https://library-management-rust-rho.vercel.app/super-admin](https://library-management-rust-rho.vercel.app/super-admin)

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access URL |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@studyos.com` | `AdminPassword@123` | [`/super-admin`](https://library-management-rust-rho.vercel.app/super-admin) |
| **🏢 Library Owner** | `owner@studyspace.com` | `password123` | [`/dashboard`](https://library-management-rust-rho.vercel.app/dashboard) |
| **🧑‍🎓 Student Self-Service** | Phone: `9876543210` or Admission ID: `ADM-101` | *No password required* | [`/portal`](https://library-management-rust-rho.vercel.app/portal) |

---

## 🌟 System Architecture & Topology

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

## 🚀 Core Features & Engineering Highlights

### 1. 👑 Super Admin Platform Command Center (`/super-admin`)
- **Platform Analytics**: Live tracking of Total Libraries, Active Subscriptions, Platform MRR (Monthly Recurring Revenue), and Cumulative GMV.
- **Tenant Control**: Instant plan tier overrides (Free, Pro, Enterprise) and tenant status suspension.
- **Support Impersonation**: 1-click **"Login as Owner"** session bridge to troubleshoot client libraries without sharing credentials.

### 2. 🪑 Visual Seat Matrix & Collision Detection Engine
- Real-time desk grid layout (Floor 1, Floor 2, AC/Non-AC, Cubicles).
- Automatic collision detection mathematically prevents double-booking across Morning, Afternoon, Evening, and 24-Hour slots.

### 3. ⏱️ Real-Time QR Attendance & Hardware Scanner Gun Support (`/attendance`)
- Touchless Check-In / Check-Out toggle with automatic focus hours calculator.
- Built-in keystroke buffer listener compatible with physical USB / Bluetooth 2D barcode scanner guns.

### 4. 🧑‍🎓 Student Self-Service PWA Portal (`/portal`)
- Public student lookup by phone number or admission ID.
- Scannable 3D PVC Smart ID card with `@media print` cardstock layout.
- 30-day study hours ledger and 1-click UPI quick renewal modal (GPay / PhonePe / Paytm).

### 5. 💳 Razorpay SaaS Payment Gateway & Quotas
- Dynamic monthly / annual plan checkout with instant subscription activation.

### 6. ⏰ Background Automated Expiry & WhatsApp Engine
- Hourly background cron worker detects expired bookings and auto-releases reserved desks.
- Dynamic WhatsApp template customizer with variable placeholders (`{studentName}`, `{seatNumber}`, `{expiryDate}`, `{upiId}`).

### 7. 📊 Daily Expenses & P&L Engine
- Categorized expense tracking (Rent, Electricity, WiFi, Maintenance, Staff Salary).
- Live Net Profit KPI formula: `(Total Fee Inflow) - (Total Expenses)`.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Vite, Lucide React, React Query (@tanstack/react-query), Recharts.
- **Backend**: Node.js 20, Express.js 5, Mongoose ODM, Razorpay SDK, JWT, Cookie-Parser, Helmet, Mongo Sanitize.
- **DevOps & Containers**: Docker, Docker Compose, Nginx Alpine, Vercel SPA Routing, Render Cloud.

---

## ⚡ Local Setup

### 1. Backend Server
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### 2. Frontend Client
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Runs at `http://localhost:5173`.

---

## 🐳 Docker Deployment

```bash
docker-compose up -d --build
```
- **Web App**: `http://localhost`
- **Backend API**: `http://localhost:8000`
- **Health Check**: `http://localhost:8000/health`

---

## 📄 License
ISC License. Designed & Developed for Modern Study Libraries & Reading Rooms.

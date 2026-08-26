# 🏨 HotelHub Enterprise — Commercial Hotel Booking Platform

A full-stack, enterprise-grade **Hotel Booking Platform** built with **React + Vite (Web Platform)**, **Expo + React Native (Customer Mobile App)**, and **Node.js + Express + MongoDB/Mongoose (REST API Server)**.

---

## 📁 Project Architecture

```
Hotel-app/
├── frontend/               # React + Vite Web Platform (Admin Panel + Hotel Owner Panel)
│   ├── src/
│   │   ├── views/
│   │   │   ├── admin/      # Executive Dashboard, Hotels, KYC, Bookings, Payments, Refunds, Admins, Profile
│   │   │   ├── owner/      # Property Details, Rooms, Availability Matrix, Check-In, Check-Out, Earnings
│   │   │   └── auth/       # Authentication Views
│   │   ├── services/api.js # Unified REST API Client & Session Manager
│   │   └── main.js         # Canonical HashRouter & RBAC Route Guard
│   ├── .env                # Web configuration (VITE_API_URL=http://localhost:5000/api)
│   └── package.json
│
├── mobile/                 # Expo + React Native Customer Mobile App
│   ├── src/
│   │   ├── screens/        # Explore, Hotel Details, Booking Checkout, My Trips, E-Pass, Reviews, Helpdesk
│   │   ├── navigation/     # Tab & Stack Navigators
│   │   └── services/api.js # Mobile API Client
│   ├── .env                # Mobile configuration (EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api)
│   └── app.json
│
├── server/                 # Node.js + Express + MongoDB REST API Engine
│   ├── src/
│   │   ├── db/             # Mongoose connection & ACID transactional persistence
│   │   ├── middleware/     # JWT Auth, Role Hierarchy, Permission Guards, Error Handlers
│   │   ├── models/         # Mongoose Schemas (User, Hotel, Room, Booking, Payment, Refund, AuditLog, etc.)
│   │   └── routes/         # Modular REST Endpoints (Auth, Admin, Hotels, Rooms, Bookings, Payments, etc.)
│   ├── .env                # Server configuration (PORT=5000, MONGODB_URI, JWT_SECRET)
│   └── package.json
│
└── test-e2e.js             # Comprehensive 37-step Automated End-to-End Test Suite
```

---

---

## 🔐 Unified Authentication Architecture (`/login`)

Both **Platform Administrators** and **Hotel Property Admins** log in via the single unified login portal at:
👉 **`http://localhost:3001/#/login`**

The backend automatically identifies the authenticated role from MongoDB and routes the user to their designated dashboard:

| Role | Unified Login URL | Email | Password | Destination Dashboard |
|---|---|---|---|---|
| 👑 **Super Admin** | `http://localhost:3001/#/login` | `admin@hotelhub.com` | `Admin@123456` *(or `Admin@123`)* | `#/admin/dashboard` |
| 💼 **Operations Admin** | `http://localhost:3001/#/login` | `manager@hotelhub.com` | `Admin@123456` | `#/admin/dashboard` |
| 💳 **Finance Admin** | `http://localhost:3001/#/login` | `finance.admin@hotelhub.com` | `Admin@123456` | `#/admin/payments` |
| 🎧 **Support Admin** | `http://localhost:3001/#/login` | `support.admin@hotelhub.com` | `Admin@123456` | `#/admin/support` |
| 🏨 **Hotel Admin (Main)** | `http://localhost:3001/#/login` | `hoteladmin@hotelhub.com` | `HotelAdmin@123456` | `#/hotel-admin/dashboard` |
| 🏨 **Hotel Admin A** *(Grand Horizon)* | `http://localhost:3001/#/login` | `hoteladminA@hotelhub.com` | `HotelAdmin@123456` | `#/hotel-admin/dashboard` |
| 🏨 **Hotel Admin B** *(Royal Heritage)* | `http://localhost:3001/#/login` | `hoteladminB@hotelhub.com` | `HotelAdmin@123456` | `#/hotel-admin/dashboard` |
| 🏨 **Hotel Owner** | `http://localhost:3001/#/login` | `rajesh@grandhorizon.com` | `Password@123` | `#/hotel-admin/dashboard` |
| 📱 **Customer** | Mobile Expo App | `aarav.sharma@gmail.com` | `Password@123` | Expo Mobile App |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **MongoDB** (Local instance or MongoDB Atlas Cloud URI)

---

### 2. Backend Setup (`server/`)
```bash
cd server
npm install

# Seed the database with commercial hospitality data & admin accounts
npm run seed

# Start the Backend REST API (Port 5000)
npm start
```
> **Backend API URL**: `http://localhost:5000/api`  
> **Health Check**: `http://localhost:5000/api/health`

---

### 3. Frontend Web Platform Setup (`frontend/`)
```bash
cd frontend
npm install

# Start the Web Platform (Port 3001)
npm run dev
```
> **Web Platform URL**: `http://localhost:3001/#/admin/login`  
> **Owner Portal URL**: `http://localhost:3001/#/owner/login`

---

### 4. Customer Mobile App Setup (`mobile/`)
```bash
cd mobile
npm install

# Start the Expo development server
npm start
```

---

## 🧪 Automated End-to-End Testing (37/37 Tests)

Run the comprehensive 37-step verification suite from the project root:

```bash
node test-e2e.js
```

### Test Coverage Highlights:
1. **Core Platform**: Web Server (3001), API Health (5000), Admin Auth, Owner Auth, Customer Auth.
2. **Hotel Governance**: Property inspection, Owner KYC approval, Room categories, 14-day Availability matrix & blackout blocking.
3. **Transactions**: Customer atomic booking with double-booking prevention, Guest check-in desk, Stay check-out & inventory release.
4. **Finance & Policies**: Cancellation with 10% policy fee deduction, 15% platform take-rate ledger, 85% owner net earnings, Daily/Monthly income statements.
5. **Security & RBAC**:
   - Super admin initial setup blocking (once exists).
   - Inactive & suspended account login rejection.
   - Granular admin provisioning (`POST /api/auth/admin/create`).
   - Super admin role/status updates and admin deletion.
   - Customer & Owner access blocking to admin APIs (403 Forbidden).
   - Support admin access blocking to financial settlement APIs (403 Forbidden).
   - Admin profile management and secure password changes.

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://harshsingh78392133:harshsingh78392@cluster0.dju0nil.mongodb.net/hotelhub?retryWrites=true&w=majority&appName=Cluster0
DATABASE_URI=mongodb+srv://harshsingh78392133:harshsingh78392@cluster0.dju0nil.mongodb.net/hotelhub?retryWrites=true&w=majority&appName=Cluster0
DATABASE_FILE=./src/db/database.json
JWT_SECRET=hotelhub_production_jwt_secret_key_2026_super_secure_enterprise
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3001
DEFAULT_COMMISSION_RATE=15
DEFAULT_CANCEL_FEE_PCT=10
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_TITLE=HotelHub Enterprise
VITE_APP_ENV=development
```

### Mobile (`mobile/.env`)
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
EXPO_PUBLIC_APP_ENV=development
```

---

## 🔒 Security Features
- **Bcrypt Password Hashing**: Passwords stored as one-way salted hashes.
- **JWT Authorization**: Signed bearer tokens with role & permission claims.
- **Tamper-Proof Audit Logging**: Tracks all administrative state changes (`/api/admin/audit-logs`).
- **Protected Routes**: Frontend automatically prevents unauthorized navigation and displays 403 Forbidden views.

---

## 📄 License
MIT License © 2026 HotelHub Global Hospitality Technologies.

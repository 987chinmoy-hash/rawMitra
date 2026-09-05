# rawMitra 
### Shared Raw Material Procurement & Cost Coordination Portal
> **Hackathon Problem Statement: WEB06** — Connecting rural artisans for collective raw material purchasing, transparent logistics cost allocation, and institutional fraud protection.

---

## 📌 Executive Summary
Small-scale artisans across Assam and the Northeast (specializing in Muga silk, bamboo, terracotta clay, bell metal, and dyes) are routinely exploited by high retail prices and steep solo transport charges (often ₹500–₹800 per shipment).

**rawMitra** solves this by grouping geographically close artisans who share common material needs into collective procurement pools, unlocking wholesale supplier tier discounts (up to 35% savings) and fairly distributing transport charges using a mathematical cost-split algorithm.

---

## 🌟 Key Features

### 1. Three-Sided Synchronized Ecosystem
* **Artisans:** Input material requirements (category, specs, quantity, needed-by date), discover local peers, compare solo vs. group rates, confirm orders, and track shipments in real time.
* **Wholesale Suppliers:** Publish catalog stock, minimum bulk discount thresholds, transport terms, and legally binding quotation validities (`Anti-Price-Gouging`).
* **Logistics Coordinators:** Claim unassigned orders requiring local pickup, manage first-mile/last-mile logistics, and advance delivery tracking stages.

### 2. Algorithmic Fair-Share Cost Allocation
* **Material Cost Share:** Calculated strictly based on proportional volume requested:
  $$\text{Material Cost} = \text{Individual Qty} \times \text{Wholesale Price}$$
* **Logistics Share:** Fixed supplier transport fee split fairly among all group members:
  $$\text{Transport Share} = \frac{\text{Total Transport Charge}}{\text{Active Group Participants}}$$
* **Solo vs. Group Procurement Toggle:** Live interactive comparison displaying the exact ₹ savings and percentage discount achieved through group buying.

### 3. Trilingual Localization & Cross-Lingual Search
* **Full Local Language Support:** Seamless toggle across **English**, **हिन्दी (Hindi)**, and **অসমীয়া (Assamese)** across all pages, forms, and status badges.
* **Semantic Token Expansion:** Searching in Assamese (e.g., `বাঁহ`, `মুগা`) instantly matches English catalog specifications (`Bamboo`, `Muga silk`).

### 4. Institutional Cryptographic Trust & Fraud Engine
* **Aadhaar Deduplication (UIDAI Compliant):** **Zero Plaintext Aadhaar numbers** are stored in rawMitra. Identities are salted and hashed into a 256-bit digest using `HMAC-SHA-256`. Any duplicate registration attempt is blocked cryptographically.
* **Automated 10% Cancellation Penalty Ledger (Rule 3):** If a participant cancels a confirmed group order, an automated 10% fine is debited to protect remaining artisans from unfair transport spikes. Repeated infractions trigger automatic account suspension.
* **Anti-Astroturfing Verified Reviews (Rule 4):** Ratings and feedback can **only** be submitted if the reviewer and counterparty are verified participants of an order marked `delivered`.
* **Live Trust Audit Inspector:** Prominent navbar badge (`🛡️ Trust Audit`) allowing evaluators to inspect live SQLite cryptographic tables in real time.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router v6, Pure CSS Design Token System, Vite 5 |
| **Backend** | Node.js 24 (ES Modules), Express.js REST API |
| **Database** | SQLite (Node 24 Native `DatabaseSync` — zero external C++ build dependencies) |
| **Authentication** | JWT (JSON Web Tokens) with Role-Based Access Control (RBAC) |
| **Cryptography** | Node.js Native `crypto` (HMAC-SHA-256, Salted Identity Digests, Bcrypt) |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** >= 20.x (Node.js 22 or 24 recommended)
* **npm** >= 10.x

### 1. Installation
Clone the repository and install dependencies for both frontend and backend:

```bash
# Clone the repository
git clone <your-repo-url>
cd rawmitra

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd server
npm install
cd ..
```

### 2. Running Locally

Open two terminal windows:

**Terminal 1 — Backend Server (Port 5000):**
```bash
cd server
node server.js
```
*Backend API and SQLite database will be live at `http://localhost:5000`.*

**Terminal 2 — Frontend Dev Server (Port 5173):**
```bash
npm run dev
```
*Open your browser and navigate to `http://localhost:5173`.*

---

## 🔑 Demo Credentials (1-Click Instant Login Available)

For lightning-fast presentation evaluation, the login modal includes **1-click instant demo profile buttons**:

| Role | Name | Phone Number | Password | Key Functionality to Demo |
|---|---|---|---|---|
| **Artisan** | Deepa Boro | `9864000001` | `password123` | Group matching, solo vs. group comparison, order tracking |
| **Supplier** | Assam Bamboo Syndicate | `9435000014` | `password123` | Live catalog, incoming artisan demand pool, wholesale orders |
| **Coordinator** | Manash Sarma | `9678000020` | `password123` | Claiming unassigned orders, advancing shipment tracking stages |

*(Note: Entering any unregistered 10-digit phone number automatically provisions a new demo artisan on the fly!)*

---

## 📁 Repository Structure

```
rawmitra/
├── src/
│   ├── components/            # Reusable UI (NavBar, AuthModal, SecurityAuditModal, Stepper, etc.)
│   ├── context/               # Global state (AppContext.jsx with optimistic SQLite sync)
│   ├── data/                  # Regional seed dataset (Assam materials, locations, artisans)
│   ├── pages/
│   │   ├── artisan/           # Artisan multi-step procurement workflow
│   │   ├── supplier/          # Supplier registration, pricing & live dashboard
│   │   ├── coordinator/       # Coordinator deal claiming & tracking dashboard
│   │   ├── Welcome.jsx        # Landing page
│   │   ├── RoleSelect.jsx     # Onboarding role selector
│   │   ├── DemandForecast.jsx # 3-4 day predictive price & demand outlook
│   │   ├── GuideBook.jsx      # Step-by-step role guides
│   │   └── SearchResults.jsx  # Multi-field cross-lingual search engine
│   ├── services/api.js        # Centralized HTTP API client with JWT handling
│   └── utils/
│       ├── i18n.js            # Trilingual dictionary (EN, HI, AS) + synonym engine
│       ├── matching.js        # Grouping & supplier offer ranking algorithm
│       └── pricing.js         # Mathematical cost splitting & forecasting formulas
├── server/
│   ├── controllers/           # Express controllers (auth, materials, orders, audit, broadcasts)
│   ├── db/
│   │   ├── database.js        # SQLite schema initialization (8 relational tables)
│   │   ├── seed.js            # Regional seed dataset
│   │   └── rawmitra.db        # Pre-seeded SQLite database file
│   ├── middleware/auth.js     # JWT verification & RBAC guards
│   ├── routes/api.js          # RESTful API route definitions
│   ├── services/fraudService.js# HMAC-SHA256 Aadhaar hashing, penalty logic, verified reviews
│   └── server.js              # Express server entry point
├── package.json               # Frontend dependencies & build scripts
├── vite.config.js             # Vite configuration with /api backend proxy
└── README.md                  # Complete project documentation
```

---

## 🛡️ Hackathon Submission Branches

* **`main`**: Production-ready, fully integrated portal with all features, database persistence, and documentation.
* **`feat/artisan-portal-i18n`**: Multi-step procurement flow, fair-share cost splitting, and Assamese/Hindi localization.
* **`feat/backend-sqlite-auth`**: Express REST API, SQLite relational schema, and JWT authentication.
* **`feat/fraud-governance-audit`**: Cryptographic HMAC-SHA256 Aadhaar deduplication, penalty ledger, and Trust Audit Inspector.

---

## 👥 Team & Acknowledgments
Built with ❤️ for rural Indian artisans. Special thanks to the hackathon organizers and mentors for problem statement **WEB06**.

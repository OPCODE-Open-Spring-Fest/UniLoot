# UniLoot Backend ⚙️  
_Secure. Scalable. Real-time._

## 📘 Overview
The **UniLoot Backend** powers all business logic, authentication, and data management for the UniLoot platform. It handles product listings, user management, auctions, payments, and notifications using RESTful APIs or GraphQL.

---

## 🚀 Features
- 🔐 **Authentication & Authorization:** JWT-based auth with college email verification.  
- 📦 **Product Listings:** CRUD APIs for sellers.  
- 💰 **Auction System:** Real-time bidding via Socket.IO.  
- 💳 **Payments:** Razorpay or Stripe integration with escrow logic.  
- 📧 **Email Service:** Notifications via Nodemailer or SendGrid.  
- 🧠 **Admin Controls:** Manage users, disputes, and analytics.  
- 📊 **Logging & Monitoring:** Winston/Morgan integrated.  

---

## 🏗️ Tech Stack
| Layer | Technology |
|-------|-------------|
| Backend Framework | Node.js (Express.js) |
| Database | PostgreSQL / MongoDB |
| ORM | Prisma / Mongoose |
| Real-time | Socket.IO |
| Authentication | JWT + Nodemailer verification |
| Payment Gateway | Razorpay / Stripe |
| Deployment | Docker + VPS / Render |
| Testing | Jest / Supertest |

---

## 📁 Folder Structure
backend/
├── src/
│ ├── config/ # Env configs, DB connection
│ ├── controllers/ # Request handlers
│ ├── models/ # DB schemas
│ ├── routes/ # API route definitions
│ ├── middleware/ # Auth, validation, error handling
│ ├── services/ # Business logic and integrations
│ ├── utils/ # Helpers, constants
│ └── app.js # Main Express app
├── tests/ # Unit/integration tests
├── .env.example # Example environment variables
├── package.json
└── README.md


---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v20+
- PostgreSQL / MongoDB running locally
- Docker (optional)
- Razorpay / Stripe credentials

### Steps
```bash
cd UniLoot/backend
npm install
cp .env.example .env


## Run the server
npm run dev

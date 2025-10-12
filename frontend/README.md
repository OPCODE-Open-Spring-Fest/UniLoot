# UniLoot Frontend 🎓🛒  
Your Campus Marketplace. Sell your legacy, find your loot. — Built for Students, by Students._

## 📘 Overview
The **UniLoot Frontend** is the user-facing layer of the UniLoot platform, built with **React.js** (or Next.js). It provides smooth navigation, real-time bidding updates, and secure shopping flows tailored for college students.  

This app allows:
- Seniors to list and manage their items.
- Juniors to browse, bid, and buy.
- Admins to manage the platform with dashboards.

---

## 🚀 Features
- 🎯 **Dual Listings:** Buy Now & Auction modes.  
- 🧭 **Search & Filter:** Sort by category, price, or sale type.  
- 💬 **Real-Time Updates:** Instant outbid and sale notifications (via Socket.IO).  
- 🔒 **Secure Authentication:** College email verification integrated with backend API.  
- 💸 **Razorpay/Stripe Payment UI:** Simplified checkout experience.  
- 🗂️ **User Dashboards:** For both sellers and buyers.  

---

## 🏗️ Tech Stack
| Layer | Technology |
|-------|-------------|
| Framework | React.js (with Vite or Next.js SSR) |
| State Management | Redux Toolkit / Context API |
| Styling | TailwindCSS / Shadcn UI |
| API Communication | Axios + REST / GraphQL |
| Real-Time | Socket.IO Client |
| Routing | React Router / Next.js Routing |
| Deployment | Vercel / Netlify |

---

## 📁 Folder Structure

frontend/
├── public/ # Static assets (logos, icons)
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Page-level components
│ ├── hooks/ # Custom React hooks
│ ├── context/ # Context providers
│ ├── redux/ # Redux store & slices
│ ├── services/ # API service functions
│ ├── utils/ # Helpers & formatters
│ └── styles/ # Tailwind/global styles
├── .env.example # Environment variable template
├── package.json
└── README.md


---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v20+
- npm or yarn
- Backend server running (`http://localhost:5000` default)

### Steps
```bash
# Clone main repo
git clone https://github.com/OPCODE-Open-Spring-Fest/UniLoot.git
cd UniLoot/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

#Run the frontend
npm run dev

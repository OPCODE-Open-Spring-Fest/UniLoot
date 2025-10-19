# UniLoot 🎓🛒  
*Your Campus Marketplace. Sell your legacy, find your loot.*
<img width="1897" height="877" alt="image" src="https://github.com/user-attachments/assets/4f4a952a-3c70-4428-91bf-207a60150806" />
<img width="1905" height="852" alt="image" src="https://github.com/user-attachments/assets/a51052f3-9fe0-41ce-95c5-9599512fbd2c" />
<img width="1898" height="858" alt="image" src="https://github.com/user-attachments/assets/3ad02a3c-9c15-4fe2-8a32-fa6786d40aed" />

<div align="center">

![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)
![Build Passing](https://img.shields.io/badge/build-passing-green)
![Label Checker](https://github.com/OPCODE-Open-Spring-Fest/UniLoot/actions/workflows/checklabels.yaml/badge.svg)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [User Roles & Journeys](#user-roles--journeys)
- [Platform Enhancements](#platform-enhancements)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Project Roadmap](#project-roadmap)
- [Contact & Acknowledgments](#contact--acknowledgments)

---

## Overview

**UniLoot** is a hyper-local, college-exclusive e-commerce platform built for seamless, secure, and affordable student-to-student selling. Graduating seniors can list used items (books, electronics, furniture, etc.), and juniors can find campus essentials either at a fixed price or by placing bids in auctions. The platform fosters trust via college email verification and reputation/rating mechanisms.

---

## Core Features

- **Dual Product Listings**
  - *Fixed Price ("Buy Now")*: Set by seller; juniors can purchase instantly.
  - *Auction (Negotiable)*: 48-hour bidding, minimum increment ₹100, seller can accept highest bid early.
- **User Authentication**
  - Register/login with secure password protocol.
  - Mandatory college email verification for access.
- **Seller Dashboard**
  - Create, edit, manage listings, track bids, finalize sales.
- **Buyer Experience**
  - Browse, filter, search; add fixed-price items to cart or bid in auctions.
  - View and manage cart, bidding history.
- **Integrated Payments**
  - Secure payment flow using Razorpay/Stripe, with platform commission if applicable.
- **Shopping Cart**
  - Multi-item management and purchase.

---

## User Roles & Journeys

### 🎓 Senior (Seller)
- Onboards with college email.
- Lists products for sale, chooses fixed or auction format.
- Tracks and manages active listings and bids.
- Can accept a bid or let the auction finish.
- Receives funds when sale is confirmed.

### 🧑‍🎓 Junior (Buyer)
- Registers with college email.
- Searches, browses, and filters all listings.
- Adds fixed-price items to cart and makes instant purchases.
- Places bids on auction items, receives live outbid notifications.
- Pays for items and arranges pickup with seller.

---

## Platform Enhancements

- **User Profiles:** Rate and review system builds trust for future transactions.
- **Direct Messaging:** Secure in-app chat for questions, logistics, and negotiation.
- **Advanced Categories & Search:** Find items by type, price, or sale type.
- **Escrow System:** Funds released only after buyers confirm item receipt.
- **Notification System:** Real-time email/app alerts for outbidding, sales, auction results, and more.
- **Wishlist:** Buyers can save and revisit interesting listings.
- **Admin Dashboard:** Site management, dispute resolution, and analytics.

---

## Tech Stack

| Layer      | Technology Suggestion                             |
| ---------- | ------------------------------------------------ |
| Frontend   | React.js (w/ Next.js SSR), or Vue.js             |
| Backend    | Node.js (Express.js), or Python (Django)         |
| Database   | PostgreSQL (preferred) or MongoDB                |
| Real-time  | Socket.IO or WebSockets (for bids & chat)        |
| Payments   | Razorpay or Stripe (API-integrated)              |
| Email      | Nodemailer, SendGrid, or similar                 |
| Deployment | Docker, Vercel/Netlify for frontend, VPS/cloud   |

---

## Folder Structure

```
UniLoot/
├── .github/                 # GitHub specific configurations
│   ├── workflows/           # CI/CD workflows
│   ├── ISSUE_TEMPLATE/      # Issue templates
│   └── Contributor_Guide/   # Contribution guidelines
├── frontend/                # Frontend application (to be created)
├── backend/                 # Backend application (to be created)
├── docs/                    # Documentation (to be created)
├── CODE_OF_CONDUCT.md       # Code of conduct
├── README.md                # This file
└── package.json             # Node.js dependencies
```

---

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OPCODE-Open-Spring-Fest/UniLoot.git
   cd UniLoot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up commit hooks**
   ```bash
   npm run prepare
   ```

### Development

This project uses conventional commits. Make sure your commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

```bash
# Example commit messages
git commit -m "feat: add user authentication"
git commit -m "fix: resolve payment gateway issue"
git commit -m "docs: update README with setup instructions"
```

### Commit Message Validation

#### 🔍 Commitlint (Local Git Hooks)
- **Validates** all commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/) format
- **Runs on**: Every commit (via Husky git hooks)
- **Required format**: `type(scope): description`
- **Common types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### GitHub Actions Workflows

#### 🏷️ Label Checker
- **Validates** that pull requests have required labels before merging
- **Required labels** (one from each group):
  - **Type**: `Type:Easy`, `Type:Medium`, or `Type:Hard`
  - **Semver**: `Semver:major`, `Semver:minor`, or `Semver:patch`
  - **Status**: `PR:Accept`
- **Runs on**: Pull request opened, edited, synchronized, reopened, labeled, or unlabeled events

All checks must pass before a pull request can be merged.

---

## Contributing

We welcome contributions from the community! 🎉

Please read our [Contributing Guide](.github/Contributor_Guide/Contributing.md) to learn about our development process, how to propose bugfixes and improvements, and how to build and test your changes.

### Quick Contribution Steps

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes following [conventional commits](.github/Contributor_Guide/commiting.md)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Make sure to:
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)
- Write clear commit messages following the conventional commits format
- Add appropriate labels to your PR (Type, Semver, and PR:Accept)
- Ensure all GitHub Actions checks pass
- Update documentation as needed

---

## Project Roadmap

### Phase 1: Foundation (Current)
- [x] Repository setup
- [x] CI/CD pipeline configuration
- [ ] Database schema design
- [ ] API architecture planning

### Phase 2: Core Development
- [ ] User authentication system
- [ ] Product listing functionality
- [ ] Bidding system implementation
- [ ] Payment gateway integration

### Phase 3: Enhancements
- [ ] Real-time notifications
- [ ] In-app messaging
- [ ] User rating and review system
- [ ] Admin dashboard

### Phase 4: Launch
- [ ] Beta testing
- [ ] Bug fixes and optimization
- [ ] Documentation completion
- [ ] Production deployment

---

## Contact & Acknowledgments

### Maintainers

This project is maintained by the OPCODE community at IIIT Bhagalpur.

### Acknowledgments

- Thanks to all contributors who help make UniLoot better!
- Built as part of the Open Spring Fest initiative
- Special thanks to the open-source community

### Support

- 📧 Email: opcode@iiitbh.ac.in
- 🌐 Website: [OPCODE IIIT Bhagalpur](https://opcode.gymkhana.iiitbh.ac.in)
- 💬 Join our community discussions

---

<div align="center">

**Made with ❤️ by the OPCODE Community**

[![GitHub stars](https://img.shields.io/github/stars/OPCODE-Open-Spring-Fest/UniLoot?style=social)](https://github.com/OPCODE-Open-Spring-Fest/UniLoot/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/OPCODE-Open-Spring-Fest/UniLoot?style=social)](https://github.com/OPCODE-Open-Spring-Fest/UniLoot/network/members)
[![GitHub issues](https://img.shields.io/github/issues/OPCODE-Open-Spring-Fest/UniLoot)](https://github.com/OPCODE-Open-Spring-Fest/UniLoot/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/OPCODE-Open-Spring-Fest/UniLoot)](https://github.com/OPCODE-Open-Spring-Fest/UniLoot/pulls)

</div>

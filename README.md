# DAMP - Digital Asset Management & Property

DAMP is a comprehensive property management and real estate collaboration platform. It provides a full-stack ecosystem including a robust backend API, a public-facing web portal, an administrative dashboard, and a feature-rich mobile application for field agents.

---

## 🏗️ Project Architecture

The repository is organized as a monorepo containing the following core modules:

| Module              | Directory              | Description                                            | Technology Stack             |
| :------------------ | :--------------------- | :----------------------------------------------------- | :--------------------------- |
| **API Engine**      | `backend/`             | Core server handling business logic, data, and auth.   | Node.js, Express, PostgreSQL |
| **Agent Workspace** | `frontendApp/`         | Mobile app for field agents to manage leads and deals. | React Native, Expo, Redux    |
| **Client Hub**      | `frontend/`            | Public-facing landing page and marketing portal.       | React 19, Vite, Tailwind     |
| **Ops Dashboard**   | `frontend_AdminPanel/` | Administrative interface for platform operations.      | React 19, Vite, Tailwind     |

---

## 🛠️ Module Details

### 1. API Engine (`backend/`)

The foundational layer powered by Express and PostgreSQL. It manages secure data flow and authentication.

- **Primary Features**:
  - JWT-based user authentication and authorization.
  - CRUD operations for Property listings and Customer (Lead) management.
  - Task and follow-up scheduling logic.
  - Collaborative tool endpoints for agents.
  - Security-hardened with `helmet`, `cors`, and `morgan` logging.

### 2. Agent Workspace (`frontendApp/`)

A mobile-first experience built with Expo to empower real estate agents on the go.

- **Primary Features**:
  - **Daily Planner**: Interactive timeline for meetings and site visits.
  - **Lead Management**: Track customers through sales stages (New → Site Visit → Completed).
  - **Deal Manager**: Detailed flow for payment tracking, token payments, and settlements.
  - **Property Discovery**: Searchable database of available listings.
  - **State Mgmt**: Global state handling using Redux Toolkit.

### 3. Client Hub (`frontend/`)

A modern, responsive web application designed for client acquisition and engagement.

- **Primary Features**:
  - Feature-rich landing page with modern UI sections (Hero, Features, CTA).
  - Integration with Google OAuth for streamlined access.
  - Built with Vite for rapid development and optimized builds.

### 4. Ops Dashboard (`frontend_AdminPanel/`)

A specialized dashboard for administrative oversight.

- **Primary Features**:
  - Centralized management of platform data.
  - Custom administrative views for operational efficiency.
  - Consistent design language with the Client Hub.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (or a Supabase instance)

### Setup Instructions

#### 1. API Engine

```bash
cd backend
npm install
cp .env.example .env  # Configure your database and JWT keys
npm run dev
```

#### 2. Agent Workspace (Mobile)

```bash
cd frontendApp
npm install
npx expo start
```

#### 3. Web Frontends (Frontend & Admin Panel)

```bash
cd frontend  # or cd frontend_AdminPanel
npm install
npm run dev
```

---

## 🧹 Maintenance & Cleanup

This project follows strict cleanup guidelines:

- **No Console Logs**: Debug logs are removed from production code.
- **Ignored Dependencies**: `node_modules` are excluded from version control.
- **Environment Safety**: Secret keys are managed via `.env` files (excluded) with `.env.example` templates provided.

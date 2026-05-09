# AKExpenses — Roommate Expense Tracker

A full-stack expense tracking app built for roommates to split and settle shared costs. Tracks who paid, who owes whom, and recommends settlements — all with role-based access control.

## Features

- **Add Expenses** — Record shared expenses with item name, amount, payer, and split details
- **Dashboard** — Monthly summary showing total spent, individual contributions, balances, and settlement suggestions
- **Expense List** — Searchable, filterable history of all expenses with month-based filtering
- **Settle Up** — One-click settlement recording with automatic balance recalculation
- **Role-Based Access** — Admin (Anup Kundu) can edit/delete any expense; regular users can only add
- **Clerk Authentication** — Secure sign-in/sign-up with session management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Auth | Clerk (React + Express SDKs) |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |

## Project Structure

```
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # API business logic
│   ├── middleware/auth.js         # Clerk auth + user sync
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # Express routes
│   ├── utils/seedUsers.js        # Initial user seeding
│   ├── server.js                 # Express app entry point
│   └── .env.example              # Environment template
└── frontend/
    ├── src/
    │   ├── components/           # Navbar, Footer, ExpenseCard, ExpenseForm
    │   ├── pages/                # Dashboard, AddExpense, ExpenseList
    │   ├── App.jsx               # Routes and layout
    │   ├── ExpenseContext.jsx     # Global state and API calls
    │   ├── useExpense.js         # Context hook
    │   ├── constants.js          # API URL and user list
    │   └── main.jsx              # App entry point
    └── .env.example              # Environment template
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Clerk account ([clerk.com](https://clerk.com))

### 1. Clone the repository

```bash
git clone https://github.com/anupkundu2024/AK-Expense-tracker.git
cd AK-Expense-tracker
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your actual values:

```env
MONGO_URI=your_mongodb_atlas_uri
CLERK_SECRET_KEY=your_clerk_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` with your actual values:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 4. Run the app

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Users

The app is designed for three roommates:

| Name | Role |
|------|------|
| Anup Kundu | Admin |
| Sayan Nandi | User |
| Sayan Mondal | User |

## Author

**Anup Kundu** — [GitHub](https://github.com/anupkundu2024)

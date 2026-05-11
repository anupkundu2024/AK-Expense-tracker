require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { clerkMiddleware } = require("@clerk/express");
const connectDB = require("./config/db");
const seedUsers = require("./utils/seedUsers");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// CORS configuration - allow local development and deployed frontend
const corsOptions = {
  origin: ["http://localhost:5173", "https://ak-expense-tracker.vercel.app", FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Clerk middleware - authenticates requests via session cookies or Bearer tokens
// Must be applied before routes so getAuth(req) works in route handlers
app.use(
  clerkMiddleware({
    authorizedParties: [FRONTEND_URL],
  }),
);

// Routes
const expenseRoutes = require("./routes/expenseRoutes");

app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend");
});

const startServer = async () => {
  try {
    await connectDB();
    await seedUsers();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
      console.log(`CLERK_SECRET_KEY loaded: ${!!process.env.CLERK_SECRET_KEY}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message || error);
    console.error(
      "Ensure MongoDB Atlas URI is correct, your current IP is whitelisted in Atlas, and backend/.env is configured.",
    );
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

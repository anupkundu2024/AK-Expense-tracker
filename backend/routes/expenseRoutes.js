const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const { checkAdmin } = require("../middleware/role");
const {
  getAllExpenses,
  addExpense,
  settleUp,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

router.get("/", verifyToken, getAllExpenses);
router.post("/", verifyToken, addExpense);
router.post("/settle", verifyToken, settleUp);
router.put("/:id", verifyToken, checkAdmin, updateExpense);
router.delete("/:id", verifyToken, checkAdmin, deleteExpense);

module.exports = router;

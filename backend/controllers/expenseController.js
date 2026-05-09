const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");

const ALLOWED_USERS = ["Anup Kundu", "Sayan Nandi", "Sayan Mondal"];
const LEGACY_NAME_MAP = {
  Anup: "Anup Kundu",
  sayanN: "Sayan Nandi",
  SayanM: "Sayan Mondal",
};

const normalizeUserName = (name) => {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  return LEGACY_NAME_MAP[trimmed] || trimmed;
};

const formatMonth = (dateString) => {
  const expenseDate = new Date(dateString);
  return expenseDate.toISOString().slice(0, 7);
};

const toLocalDateOnly = (dateString) => new Date(`${dateString}T00:00:00`);

const isFutureDate = (dateString) => {
  if (!dateString) return false;
  const parsedDate = toLocalDateOnly(dateString);
  if (Number.isNaN(parsedDate.getTime())) return false;
  const today = toLocalDateOnly(new Date().toISOString().split("T")[0]);
  return parsedDate > today;
};

const createEmptyMonthSummary = () => {
  const users = {};
  ALLOWED_USERS.forEach((user) => {
    users[user] = {
      totalPaid: 0,
      totalShare: 0,
      balance: 0,
    };
  });

  return {
    totalSpent: 0,
    totalSettled: 0,
    users,
    settlements: [],
    recordedSettlements: [],
  };
};

const ensureUser = (monthData, user) => {
  if (!monthData.users[user]) {
    monthData.users[user] = {
      totalPaid: 0,
      totalShare: 0,
      balance: 0,
    };
  }
};

const calculateMonthlySummary = (expenses, settlements = []) => {
  const summary = {};

  expenses.forEach((expense) => {
    const paidBy = normalizeUserName(expense.paidBy);
    const monthKey = expense.month;

    if (!summary[monthKey]) {
      summary[monthKey] = createEmptyMonthSummary();
    }

    const monthData = summary[monthKey];
    monthData.totalSpent += expense.amount;
    ensureUser(monthData, paidBy);
    monthData.users[paidBy].totalPaid += expense.amount;

    expense.sharedBy.forEach((person) => {
      const normalizedPerson = normalizeUserName(person);
      ensureUser(monthData, normalizedPerson);
      monthData.users[normalizedPerson].totalShare +=
        expense.amount / expense.sharedBy.length;
    });
  });

  Object.keys(summary).forEach((monthKey) => {
    const monthData = summary[monthKey];
    const balances = [];

    Object.entries(monthData.users).forEach(([user, values]) => {
      values.balance = parseFloat(
        (values.totalPaid - values.totalShare).toFixed(2),
      );
      balances.push({ user, balance: values.balance });
    });

    monthData.recordedSettlements = [];
    monthData.totalSettled = 0;
  });

  settlements.forEach((settlement) => {
    const monthKey = settlement.month;
    if (!summary[monthKey]) {
      summary[monthKey] = createEmptyMonthSummary();
    }

    const monthData = summary[monthKey];
    const from = normalizeUserName(settlement.from);
    const to = normalizeUserName(settlement.to);
    const amount = parseFloat(settlement.amount);

    ensureUser(monthData, from);
    ensureUser(monthData, to);

    monthData.totalSettled += amount;
    monthData.users[from].balance = parseFloat(
      (monthData.users[from].balance - amount).toFixed(2),
    );
    monthData.users[to].balance = parseFloat(
      (monthData.users[to].balance + amount).toFixed(2),
    );
    monthData.recordedSettlements.push({
      ...settlement,
      from,
      to,
      amount,
    });
  });

  Object.keys(summary).forEach((monthKey) => {
    const monthData = summary[monthKey];
    const balances = Object.entries(monthData.users).map(([user, values]) => ({
      user,
      balance: parseFloat(values.balance.toFixed(2)),
    }));

    const creditors = balances
      .filter((item) => item.balance > 0)
      .sort((a, b) => b.balance - a.balance);
    const debtors = balances
      .filter((item) => item.balance < 0)
      .sort((a, b) => a.balance - b.balance);

    const recommended = [];
    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amount <= 0) break;

      recommended.push({
        from: debtor.user,
        to: creditor.user,
        amount: parseFloat(amount.toFixed(2)),
      });

      creditor.balance = parseFloat((creditor.balance - amount).toFixed(2));
      debtor.balance = parseFloat((debtor.balance + amount).toFixed(2));

      if (creditor.balance === 0) creditorIndex += 1;
      if (debtor.balance === 0) debtorIndex += 1;
    }

    monthData.settlements = recommended;
  });

  return summary;
};

const normalizeExpense = (expense) => {
  const exp = expense.toObject ? expense.toObject() : expense;
  const normalizedPaidBy = normalizeUserName(exp.paidBy);
  const rawCreatedBy = exp.createdBy || exp.paidBy || "Unknown";
  return {
    ...exp,
    id: exp._id || exp.id,
    paidBy: normalizedPaidBy,
    sharedBy: (exp.sharedBy || []).map(normalizeUserName),
    createdBy: normalizeUserName(rawCreatedBy),
  };
};

const normalizeSettlement = (settlement) => {
  const record = settlement.toObject ? settlement.toObject() : settlement;
  return {
    ...record,
    id: record._id || record.id,
    from: normalizeUserName(record.from),
    to: normalizeUserName(record.to),
    amount: parseFloat(record.amount),
  };
};

// Get all expenses and settlements
const getAllExpenses = async (req, res) => {
  try {
    const [expenses, settlements] = await Promise.all([
      Expense.find().sort({ updatedAt: -1 }),
      Settlement.find().sort({ date: -1 }),
    ]);

    const normalizedExpenses = expenses.map(normalizeExpense);
    const normalizedSettlements = settlements.map(normalizeSettlement);
    const summary = calculateMonthlySummary(
      normalizedExpenses,
      normalizedSettlements,
    );

    // Include user info in response so frontend knows the role
    const userInfo = req.user ? {
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
    } : null;

    res.json({
      expenses: normalizedExpenses,
      settlements: normalizedSettlements,
      summary,
      currentUser: userInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new expense
const addExpense = async (req, res) => {
  const { itemName, amount, paidBy, sharedBy, date, notes } = req.body;
  
  // Use paidBy from the request body (admin can add expenses for anyone)
  // Fall back to logged-in user's name if not provided
  const normalizedPaidBy = normalizeUserName(paidBy || req.user?.fullName);
  const createdBy = normalizeUserName(req.user?.fullName);

  if (!itemName || !amount || !sharedBy || !date || !normalizedPaidBy || !createdBy) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  if (!Array.isArray(sharedBy) || sharedBy.length === 0) {
    return res
      .status(400)
      .json({ message: "Select at least one person to share the expense." });
  }

  if (isFutureDate(date)) {
    return res.status(400).json({ message: "Future dates are not allowed" });
  }

  try {
    const expenseDate = new Date(date);
    const month = formatMonth(expenseDate);

    const normalizedSharedBy = sharedBy.map(normalizeUserName);
    const roundedAmount = Math.round(parseFloat(amount) * 100) / 100;
    const newExpense = new Expense({
      itemName,
      amount: roundedAmount,
      paidBy: normalizedPaidBy,
      sharedBy: normalizedSharedBy,
      date: expenseDate,
      notes: notes || "",
      month,
      createdBy,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(normalizeExpense(savedExpense));
  } catch (error) {
    console.error("[addExpense] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const settleUp = async (req, res) => {
  const { from, to, amount, date, notes } = req.body;
  const createdBy = normalizeUserName(req.user?.fullName);
  const normalizedFrom = normalizeUserName(from);
  const normalizedTo = normalizeUserName(to);

  if (
    !normalizedFrom ||
    !normalizedTo ||
    !amount ||
    !date ||
    normalizedFrom === normalizedTo
  ) {
    return res
      .status(400)
      .json({ message: "Invalid settlement data provided." });
  }

  // Admin can settle for anyone, normal users can only settle for themselves
  if (req.user?.role !== "admin" && createdBy !== normalizedFrom) {
    return res.status(403).json({
      message: "You can only record settlements from your own account.",
    });
  }

  if (
    !ALLOWED_USERS.includes(normalizedFrom) ||
    !ALLOWED_USERS.includes(normalizedTo)
  ) {
    return res
      .status(400)
      .json({ message: "Settlement must be between the three roommates." });
  }

  try {
    const settlementDate = new Date(date);
    const month = formatMonth(settlementDate);
    const createdSettlement = await Settlement.create({
      from: normalizedFrom,
      to: normalizedTo,
      amount: parseFloat(amount),
      date: settlementDate,
      month,
      createdBy,
      notes: notes || "",
    });

    const [expenses, settlements] = await Promise.all([
      Expense.find().sort({ date: -1 }),
      Settlement.find().sort({ date: -1 }),
    ]);

    const normalizedExpenses = expenses.map(normalizeExpense);
    const normalizedSettlements = settlements.map(normalizeSettlement);
    const summary = calculateMonthlySummary(
      normalizedExpenses,
      normalizedSettlements,
    );

    res.status(201).json({
      settlement: normalizeSettlement(createdSettlement),
      expenses: normalizedExpenses,
      settlements: normalizedSettlements,
      summary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update expense (admin only)
const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { itemName, amount, paidBy, sharedBy, date, notes } = req.body;

  // Only admin can edit expenses
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Only admin can edit expenses." });
  }

  try {
    const updateData = {};

    if (itemName !== undefined) updateData.itemName = itemName;
    if (amount !== undefined)
      updateData.amount = Math.round(parseFloat(amount) * 100) / 100;
    if (paidBy !== undefined) updateData.paidBy = normalizeUserName(paidBy);
    if (sharedBy !== undefined)
      updateData.sharedBy = sharedBy.map(normalizeUserName);
    if (date !== undefined) {
      if (isFutureDate(date)) {
        return res
          .status(400)
          .json({ message: "Future dates are not allowed" });
      }
      updateData.date = new Date(date);
      updateData.month = formatMonth(date);
    }
    if (notes !== undefined) updateData.notes = notes;

    const updatedExpense = await Expense.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(normalizeExpense(updatedExpense));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete expense (admin only)
const deleteExpense = async (req, res) => {
  const { id } = req.params;

  // Only admin can delete expenses
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Only admin can delete expenses." });
  }

  try {
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllExpenses,
  addExpense,
  settleUp,
  updateExpense,
  deleteExpense,
};

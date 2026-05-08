const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paidBy: {
      type: String,
      required: true,
    },
    sharedBy: {
      type: [String],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    month: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Expense", expenseSchema);

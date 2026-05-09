import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useExpense from "../useExpense";
import ExpenseCard from "../components/ExpenseCard";

const ALL_MONTHS_VALUE = "all";

const formatMonthLabel = (monthValue) => {
  try {
    return new Date(`${monthValue}-01`).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return monthValue;
  }
};

const ExpenseList = () => {
  const navigate = useNavigate();
  const { expenses } = useExpense();
  const [selectedMonth, setSelectedMonth] = useState(ALL_MONTHS_VALUE);
  const [searchQuery, setSearchQuery] = useState("");

  const hasExpenses = expenses.length > 0;

  const months = useMemo(() => {
    const seen = new Set();
    return expenses
      .map((expense) => expense.date?.slice(0, 7))
      .filter((month) => month && month.length === 7)
      .sort((a, b) => b.localeCompare(a))
      .filter((month) => {
        if (seen.has(month)) return false;
        seen.add(month);
        return true;
      });
  }, [expenses]);

  const filteredByMonth = useMemo(() => {
    if (selectedMonth === ALL_MONTHS_VALUE) {
      return expenses;
    }
    return expenses.filter(
      (expense) => expense.date?.slice(0, 7) === selectedMonth,
    );
  }, [expenses, selectedMonth]);

  const filteredAndSearched = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredByMonth;
    }

    const query = searchQuery.toLowerCase().trim();
    return filteredByMonth.filter((expense) => {
      const title = expense.itemName?.toLowerCase() || "";
      const notes = expense.notes?.toLowerCase() || "";
      const paidBy = expense.paidBy?.toLowerCase() || "";
      const createdBy = expense.createdBy?.toLowerCase() || "";

      return (
        title.includes(query) ||
        notes.includes(query) ||
        paidBy.includes(query) ||
        createdBy.includes(query)
      );
    });
  }, [filteredByMonth, searchQuery]);

  const sortedExpenses = useMemo(() => {
    return [...filteredAndSearched].sort((a, b) => {
      const aTime = Date.parse(a.updatedAt || a.createdAt || a.date || "");
      const bTime = Date.parse(b.updatedAt || b.createdAt || b.date || "");
      return bTime - aTime;
    });
  }, [filteredAndSearched]);

  const totalForMonth = useMemo(() => {
    const total = sortedExpenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0,
    );
    return Math.round(total * 100) / 100;
  }, [sortedExpenses]);

  const isFilteredEmpty = hasExpenses && sortedExpenses.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses</h1>
        <p className="text-gray-600 max-w-2xl">
          View your full expense history and filter by month to keep track of
          spending.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search expenses by item, note, paid by, or created by..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filters and Info Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Month Filter */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              Month Filter
            </p>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              <option value={ALL_MONTHS_VALUE}>All Months</option>
              {months.map((month) => (
                <option key={month} value={month} className="text-gray-900">
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>

          {/* Info Badge */}
          <div className="flex flex-col justify-end">
            <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3 text-sm font-semibold text-purple-900 shadow-sm">
              Showing {sortedExpenses.length} expense
              {sortedExpenses.length === 1 ? "" : "s"}
              {selectedMonth !== ALL_MONTHS_VALUE && hasExpenses
                ? ` • ${formatMonthLabel(selectedMonth)}`
                : ""}
            </div>
          </div>
        </div>

        {sortedExpenses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 text-white font-semibold shadow-sm inline-block">
              Total: ₹{totalForMonth.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      {/* Expenses List or Empty State */}
      {isFilteredEmpty ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center shadow-sm">
          <div className="mb-4 text-5xl">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            No expenses found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchQuery
              ? `No expenses match "${searchQuery}". Try adjusting your search or filter.`
              : `There are no expenses recorded for ${formatMonthLabel(selectedMonth)}.`}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-md"
              >
                Clear Search
              </button>
            )}
            {selectedMonth !== ALL_MONTHS_VALUE && (
              <button
                onClick={() => setSelectedMonth(ALL_MONTHS_VALUE)}
                className="inline-flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-md"
              >
                Show All Months
              </button>
            )}
          </div>
        </div>
      ) : !hasExpenses ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center shadow-sm">
          <div className="mb-4 text-6xl">💰</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            No expenses yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add your first shared expense to get started with tracking roommate
            costs.
          </p>
          <button
            onClick={() => navigate("/add-expense")}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-8 py-3 text-sm font-semibold text-white transition hover:shadow-md"
          >
            ➕ Add Your First Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedExpenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;

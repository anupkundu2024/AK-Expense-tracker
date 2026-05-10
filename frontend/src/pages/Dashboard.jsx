import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import useExpense from "../useExpense";

const Dashboard = () => {
  const {
    expenses,
    users,
    settlements,
    monthlySummary,
    settleUp,
    isAdmin,
    currentUser,
  } = useExpense();
  const { user } = useUser();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [settleLoadingId, setSettleLoadingId] = useState(null);

  const months = useMemo(
    () => Object.keys(monthlySummary).sort((a, b) => b.localeCompare(a)),
    [monthlySummary],
  );

  const currentMonth = months[0];

  const selectedMonthKey = selectedMonth || currentMonth;
  const currentSummary = selectedMonthKey
    ? monthlySummary[selectedMonthKey]
    : null;

  const formattedMonth = selectedMonthKey
    ? new Date(`${selectedMonthKey}-01`).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Current Month";

  // Use currentUser.fullName from the backend for consistent name matching
  const loggedInName = currentUser?.fullName || user?.fullName || "";

  const monthTotals = currentSummary
    ? users.map((userName) => ({
        user: userName,
        paid: currentSummary.users[userName]?.totalPaid || 0,
        share: currentSummary.users[userName]?.totalShare || 0,
        balance: currentSummary.users[userName]?.balance || 0,
      }))
    : users.map((userName) => ({
        user: userName,
        paid: 0,
        share: 0,
        balance: 0,
      }));

  const recentActivity = useMemo(() => {
    const activity = [
      ...expenses.map((expense) => ({
        id: expense.id,
        type: "expense",
        title: expense.itemName,
        amount: expense.amount,
        paidBy: expense.paidBy,
        date: expense.date,
      })),
      ...settlements.map((settlement) => ({
        id: settlement.id,
        type: "settlement",
        title: `${settlement.from} → ${settlement.to}`,
        amount: settlement.amount,
        paidBy: settlement.from,
        date: settlement.date,
      })),
    ];

    return activity
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [expenses, settlements]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track expenses and settlements with your roommates
          {isAdmin && (
            <span className="ml-2 inline-flex items-center rounded-full bg-purple-100/80 dark:bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-300 border border-purple-200/60 dark:border-purple-500/30">
              Admin
            </span>
          )}
        </p>
      </div>

      {/* Total Spent This Month - Enhanced */}
      <div className="rounded-2xl border border-purple-200 dark:border-purple-700/40 bg-gradient-to-br from-purple-50 via-purple-50 to-pink-50 dark:from-purple-900/30 dark:via-gray-800/50 dark:to-pink-900/20 p-8 shadow-lg transition-colors duration-300">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
              Total Spent This Month
            </p>
            <p className="text-3xl font-bold text-purple-900 dark:text-white">
              {formattedMonth}
            </p>
          </div>
          {months.length > 0 && (
            <div className="rounded-full border border-purple-200 dark:border-purple-600/40 bg-white/90 dark:bg-gray-800/80 px-3 py-2 text-sm font-semibold text-purple-900 dark:text-purple-300 shadow-sm">
              <label htmlFor="month-select" className="sr-only">
                Select month
              </label>
              <select
                id="month-select"
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent outline-none text-sm font-semibold text-purple-900 dark:text-purple-300"
              >
                {months.map((month) => (
                  <option key={month} value={month} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">
                    {new Date(`${month}-01`).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <p className="text-5xl font-bold text-gray-900 dark:text-white mt-6">
          ₹{currentSummary ? currentSummary.totalSpent.toFixed(2) : "0.00"}
        </p>
      </div>

      {/* Who Paid What - 3 Roommates */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Who Paid What</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {monthTotals.map((person) => (
            <div
              key={person.user}
              className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-md hover:shadow-lg transition-all duration-200 h-full flex flex-col justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {person.user}
                </p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white">
                  ₹{person.paid.toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-3">Total Paid</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final Balances Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-md transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Final Balances</h2>
        <div className="space-y-3">
          {monthTotals.map((person) => (
            <div
              key={person.user}
              className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/50 p-4"
            >
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">{person.user}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Paid: ₹{person.paid.toFixed(2)} • Share: ₹
                  {person.share.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    person.balance >= 0
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {person.balance >= 0 ? "Money to receive" : "Money to pay"}
                </span>
                <span
                  className={`rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap ${
                    person.balance >= 0
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                  }`}
                >
                  {person.balance >= 0 ? "+" : ""}₹{person.balance.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Who Owes Whom Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-md transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Who Owes Whom</h2>
        {currentSummary?.settlements?.length > 0 ? (
          <div className="space-y-3">
            {currentSummary.settlements.map((settlement, index) => {
              // Admin can settle for anyone. Normal users can only settle if they are the "from" person.
              const canSettle = isAdmin || loggedInName === settlement.from;
              const settleKey = `${settlement.from}-${settlement.to}-${index}`;
              const isLoading = settleLoadingId === settleKey;

              const handleSettleClick = async () => {
                if (!canSettle) return;
                setSettleLoadingId(settleKey);
                await settleUp({
                  ...settlement,
                  date: new Date().toISOString(),
                });
                setSettleLoadingId(null);
              };

              return (
                <div
                  key={settleKey}
                  className="flex flex-col gap-4 rounded-xl border border-amber-200 dark:border-amber-700/40 bg-amber-50 dark:bg-amber-900/20 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {settlement.from}{" "}
                      <span className="text-slate-500 dark:text-gray-400 font-normal">→</span>{" "}
                      {settlement.to}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                      Suggested repayment to keep balances even.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="font-bold text-lg text-amber-700 dark:text-amber-400">
                      ₹{settlement.amount.toFixed(2)}
                    </p>
                    {canSettle ? (
                      <button
                        onClick={handleSettleClick}
                        disabled={isLoading}
                        className="rounded-full bg-amber-700 dark:bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 dark:hover:bg-amber-700 transition disabled:bg-amber-300 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Recording..." : "Settle Up"}
                      </button>
                    ) : (
                      <span className="rounded-full bg-slate-100 dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-slate-600 dark:text-gray-300">
                        Suggested
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/30 p-8 text-center">
            <p className="text-slate-600 dark:text-gray-400 font-medium">
              All roommates are settled up for {formattedMonth}.
            </p>
          </div>
        )}
      </div>

      {/* Recent Expenses Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 shadow-md transition-colors duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Expenses</h2>
          <Link
            to="/expenses"
            className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/40 p-4 hover:bg-slate-100 dark:hover:bg-gray-700/70 transition-colors sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">
                    {item.title}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                    {item.type === "expense"
                      ? `Paid by ${item.paidBy}`
                      : `Settled by ${item.paidBy}`}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{item.amount.toFixed(2)}
                  </p>
                  <p className="text-xs font-medium text-slate-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-gray-600 bg-slate-50 dark:bg-gray-700/30 p-8 text-center">
            <p className="text-slate-600 dark:text-gray-400 font-medium">
              No expenses yet. Add one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

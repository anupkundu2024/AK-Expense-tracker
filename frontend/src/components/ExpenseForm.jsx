import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import useExpense from "../useExpense";

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { users, addExpense, loading } = useExpense();
  const [dateError, setDateError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    amount: "",
    paidBy: "",
    sharedBy: [],
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const todayDate = new Date().toISOString().split("T")[0];

  const matchedUser = user?.fullName
    ? users.find((u) => u.toLowerCase() === user.fullName.toLowerCase())
    : null;

  const selectedPaidBy = formData.paidBy || matchedUser || users[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setDateError("");

    // Validation
    if (!formData.itemName.trim()) {
      setValidationError("Please enter an item name.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      setValidationError("Please enter a valid amount greater than 0.");
      return;
    }

    if (formData.sharedBy.length === 0) {
      setValidationError("Please select at least one person to share with.");
      return;
    }

    if (!formData.date) {
      setValidationError("Please select a date.");
      return;
    }

    if (formData.date > todayDate) {
      setDateError("Future dates are not allowed");
      return;
    }

    const roundedAmount = Math.round(Number(formData.amount) * 100) / 100;
    const payload = {
      itemName: formData.itemName.trim(),
      amount: roundedAmount,
      paidBy: selectedPaidBy,
      sharedBy: formData.sharedBy,
      date: formData.date,
      notes: formData.notes.trim(),
    };


    try {
      const success = await addExpense(payload);

      if (success) {
        setFormData({
          itemName: "",
          amount: "",
          paidBy: "",
          sharedBy: [],
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        navigate("/", { replace: true });
      }
    } catch (err) {
      setValidationError(
        "Something went wrong. Check the console for details.",
      );
    }
  };

  const handleSharedByChange = (userName) => {
    setValidationError("");
    setFormData((prev) => ({
      ...prev,
      sharedBy: prev.sharedBy.includes(userName)
        ? prev.sharedBy.filter((u) => u !== userName)
        : [...prev.sharedBy, userName],
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 card-shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Validation Error */}
        {validationError && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 p-4 flex items-center gap-3">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Item Name
          </label>
          <input
            type="text"
            required
            value={formData.itemName}
            onChange={(e) => {
              setValidationError("");
              setFormData({ ...formData, itemName: e.target.value });
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all duration-200"
            placeholder="e.g., Grocery shopping, Weekly meal"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 font-medium">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formData.amount}
              onChange={(e) => {
                setValidationError("");
                setFormData({ ...formData, amount: e.target.value });
              }}
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all duration-200"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Paid By
          </label>
          <select
            required
            value={selectedPaidBy}
            onChange={(e) =>
              setFormData({ ...formData, paidBy: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 focus:outline-none transition-all duration-200"
          >
            {users.map((roommate) => (
              <option key={roommate} value={roommate}>
                {roommate}
              </option>
            ))}
          </select>
        </div>

        {/* Shared By */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Shared By
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((userName) => (
              <label
                key={userName}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  formData.sharedBy.includes(userName)
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-300 bg-gray-50 hover:bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.sharedBy.includes(userName)}
                  onChange={() => handleSharedByChange(userName)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-medium text-gray-900">{userName}</span>
              </label>
            ))}
          </div>
          {formData.sharedBy.length === 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Select at least one person who shares this expense.
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Date
          </label>
          <input
            type="date"
            required
            max={todayDate}
            value={formData.date}
            onChange={(e) => {
              const value = e.target.value;
              setFormData({ ...formData, date: value });
              setDateError(
                value > todayDate ? "Future dates are not allowed" : "",
              );
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 focus:outline-none transition-all duration-200"
          />
          {dateError && (
            <p className="mt-2 text-sm text-red-600">{dateError}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none transition-all duration-200"
            rows="4"
            placeholder="Add any additional details..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Add Expense"
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;

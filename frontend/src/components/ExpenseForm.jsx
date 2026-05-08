import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useExpense } from "../ExpenseContext";

const ExpenseForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users, addExpense, loading } = useExpense();
  const [dateError, setDateError] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    amount: "",
    paidBy: user?.name || users[0],
    sharedBy: [],
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const todayDate = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user?.name) {
      setFormData((prev) => ({ ...prev, paidBy: user.name }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.sharedBy.length === 0) {
      alert("Please select at least one person to share with");
      return;
    }

    if (formData.date > todayDate) {
      setDateError("Future dates are not allowed");
      return;
    }

    const roundedAmount = Math.round(Number(formData.amount) * 100) / 100;
    const payload = {
      itemName: formData.itemName,
      amount: roundedAmount,
      paidBy: formData.paidBy,
      createdBy: user?.name || formData.paidBy,
      sharedBy: formData.sharedBy,
      date: formData.date,
      notes: formData.notes,
    };

    const success = await addExpense(payload);

    if (success) {
      navigate("/", { replace: true });
      setFormData({
        itemName: "",
        amount: "",
        paidBy: user?.name || users[0],
        sharedBy: [],
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
  };

  const handleSharedByChange = (user) => {
    setFormData((prev) => ({
      ...prev,
      sharedBy: prev.sharedBy.includes(user)
        ? prev.sharedBy.filter((u) => u !== user)
        : [...prev.sharedBy, user],
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 card-shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Item Name
          </label>
          <input
            type="text"
            required
            value={formData.itemName}
            onChange={(e) =>
              setFormData({ ...formData, itemName: e.target.value })
            }
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
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
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
            value={formData.paidBy}
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
            {users.map((user) => (
              <label
                key={user}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 bg-gray-50 hover:bg-white cursor-pointer transition-all duration-200"
              >
                <input
                  type="checkbox"
                  checked={formData.sharedBy.includes(user)}
                  onChange={() => handleSharedByChange(user)}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="font-medium text-gray-900">{user}</span>
              </label>
            ))}
          </div>
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
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.555 5.168A1 1 0 003 6.56v.676a1 1 0 00.555.895l.308.146.662-.331a1 1 0 10-.894-1.788l-.63.315v-.497zm0 9.164a1 1 0 00-.555.895v.676a1 1 0 001 1h.676a1 1 0 00.894-.553l.146-.308-.331-.662a1 1 0 10-1.788.894l.315.63h-.497zm9.164 4.277a1 1 0 00.895.555h.676a1 1 0 001-1v-.676a1 1 0 00-.553-.895l-.308-.146-.662.331a1 1 0 101.788-.894l-.315-.63h.497zm0-9.164a1 1 0 01-.895-.555H12.56a1 1 0 00-.895 1.553l.308.146.662-.331a1 1 0 10-.894 1.788l.63-.315v.497zM5.91 7.025a1 1 0 00-1.414 0L4.277 8.243a1 1 0 001.414 1.414l1.219-1.219a1 1 0 000-1.414zm8.178 8.178a1 1 0 00-1.414-1.414l-1.219 1.219a1 1 0 001.414 1.414l1.219-1.219zm-1.414-9.592a1 1 0 000-1.414L12.043 4.277a1 1 0 10-1.414 1.414l1.219 1.219zm-8.178 8.178a1 1 0 000 1.414l1.219 1.219a1 1 0 101.414-1.414l-1.219-1.219z" />
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

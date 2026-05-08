import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useExpense } from "../ExpenseContext";

const ExpenseCard = ({ expense }) => {
  const { user } = useAuth();
  const { users, updateExpense, deleteExpense } = useExpense();
  const isAdmin = user?.role === "admin";
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    itemName: expense.itemName,
    amount: expense.amount,
    paidBy: expense.paidBy,
    sharedBy: expense.sharedBy,
    date: expense.date?.slice(0, 10) || "",
    notes: expense.notes || "",
  });

  const creatorNameRaw = expense.createdBy || expense.paidBy || "Unknown";
  const creatorName = creatorNameRaw.trim();
  const isCurrentUserCreator =
    creatorName.toLowerCase() === user?.name?.trim().toLowerCase();
  const displayedCreator = isCurrentUserCreator ? "You" : creatorName;
  const creatorInitials = isCurrentUserCreator
    ? "Y"
    : creatorName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0].toUpperCase())
        .slice(0, 2)
        .join("");

  console.log(
    "[ExpenseCard] expense.createdBy:",
    expense.createdBy,
    "displayedCreator:",
    displayedCreator,
  );
  const [actionLoading, setActionLoading] = useState(false);

  const handleSharedByChange = (user) => {
    setEditData((prev) => ({
      ...prev,
      sharedBy: prev.sharedBy.includes(user)
        ? prev.sharedBy.filter((u) => u !== user)
        : [...prev.sharedBy, user],
    }));
  };

  const handleSave = async () => {
    if (editData.sharedBy.length === 0) {
      alert("Select at least one person for shared by");
      return;
    }

    setActionLoading(true);
    await updateExpense(expense.id, {
      ...editData,
      amount: parseFloat(editData.amount),
    });
    setActionLoading(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this expense?")) {
      setActionLoading(true);
      await deleteExpense(expense.id);
      setActionLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Edit Expense
        </h3>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Item Name
            </label>
            <input
              value={editData.itemName}
              onChange={(e) =>
                setEditData({ ...editData, itemName: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 focus:outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={editData.amount}
              onChange={(e) =>
                setEditData({ ...editData, amount: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 focus:outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Paid By
            </label>
            <select
              value={editData.paidBy}
              onChange={(e) =>
                setEditData({ ...editData, paidBy: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 focus:outline-none appearance-none cursor-pointer transition-all duration-200"
            >
              {users.map((user) => (
                <option key={user} value={user} className="text-gray-900">
                  {user}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Shared By
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map((user) => (
                <label
                  key={user}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={editData.sharedBy.includes(user)}
                    onChange={() => handleSharedByChange(user)}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-gray-900">{user}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Date
            </label>
            <input
              type="date"
              value={editData.date}
              onChange={(e) =>
                setEditData({ ...editData, date: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 focus:outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes
            </label>
            <textarea
              value={editData.notes}
              onChange={(e) =>
                setEditData({ ...editData, notes: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 text-gray-900 focus:outline-none resize-none transition-all duration-200"
              rows="2"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            disabled={actionLoading}
            className="flex-1 min-w-[120px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {actionLoading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 min-w-[120px] bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-xl transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header - Title and Amount */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 break-words">
              {expense.itemName}
            </h3>
            {expense.notes && (
              <p className="text-sm text-gray-500 mt-1">
                {expense.notes.length > 60
                  ? expense.notes.substring(0, 60) + "..."
                  : expense.notes}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              ₹{Number(expense.amount || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(expense.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="px-5 py-4 space-y-3">
        {/* Paid By */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-20">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Paid By
            </p>
          </div>
          <p className="font-semibold text-gray-900 flex-1">{expense.paidBy}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100"></div>

        {/* Shared With */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-20">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Shared With
            </p>
          </div>
          <p className="font-semibold text-gray-900 flex-1">
            {expense.sharedBy.join(", ")}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100"></div>

        {/* Created By */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-20">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Created By
            </p>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                {creatorInitials || "?"}
              </span>
              <p className="font-semibold text-gray-900">{displayedCreator}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isAdmin && (
        <div className="px-5 py-3 border-t border-gray-100 flex gap-2 justify-end">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            ✏ Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg text-sm transition-all duration-200 shadow-sm hover:shadow-md"
          >
            🗑 {actionLoading ? "..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;

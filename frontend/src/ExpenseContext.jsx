import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const BASE_URL = "http://localhost:5000/api";
const users = ["Anup Kundu", "Sayan Nandi", "Sayan Mondal"];

const ExpenseContext = createContext();

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within ExpenseProvider");
  }
  return context;
};

export const ExpenseProvider = ({ children }) => {
  const { token, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const showMessage = (type, message) => {
    if (type === "success") {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 4000);
  };

  const normalizeExpenses = (list) =>
    list.map((expense) => ({
      ...expense,
      id: expense._id || expense.id,
    }));

  const normalizeSettlements = (list) =>
    list.map((settlement) => ({
      ...settlement,
      id: settlement._id || settlement.id,
    }));

  const getHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  const handleAuthError = (status, message) => {
    if (status === 401 || status === 403) {
      logout();
      showMessage("error", message || "Session expired. Please login again.");
      window.location.href = "/login";
      return true;
    }
    return false;
  };

  const fetchExpenses = async () => {
    if (!token) {
      setExpenses([]);
      setMonthlySummary({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/expenses`, {
        headers: getHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        if (handleAuthError(response.status, data.message)) return;
        throw new Error(data.message || "Unable to load expenses");
      }

      setExpenses(normalizeExpenses(data.expenses || []));
      setSettlements(normalizeSettlements(data.settlements || []));
      setMonthlySummary(data.summary || {});
    } catch (fetchError) {
      showMessage("error", fetchError.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const settleUp = async (settlement) => {
    if (!token) {
      showMessage("error", "Authentication required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/expenses/settle`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(settlement),
      });
      const data = await response.json();

      if (!response.ok) {
        if (handleAuthError(response.status, data.message)) return false;
        throw new Error(data.message || "Unable to record settlement");
      }

      setExpenses(normalizeExpenses(data.expenses || []));
      setSettlements(normalizeSettlements(data.settlements || []));
      setMonthlySummary(data.summary || {});
      showMessage("success", "Settlement recorded successfully");
      return true;
    } catch (settleError) {
      showMessage(
        "error",
        settleError.message || "Failed to record settlement",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense) => {
    if (!token) {
      showMessage("error", "Authentication required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/expenses`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(expense),
      });

      const data = await response.json();
      if (!response.ok) {
        if (handleAuthError(response.status, data.message)) return false;
        throw new Error(data.message || "Unable to add expense");
      }

      await fetchExpenses();
      showMessage("success", "Expense added successfully");
      return true;
    } catch (addError) {
      showMessage("error", addError.message || "Failed to add expense");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id, updates) => {
    if (!token) {
      showMessage("error", "Authentication required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/expenses/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (!response.ok) {
        if (handleAuthError(response.status, data.message)) return false;
        throw new Error(data.message || "Unable to update expense");
      }

      await fetchExpenses();
      showMessage("success", "Expense updated successfully");
      return true;
    } catch (updateError) {
      showMessage("error", updateError.message || "Failed to update expense");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id) => {
    if (!token) {
      showMessage("error", "Authentication required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        if (handleAuthError(response.status, data.message)) return false;
        throw new Error(data.message || "Unable to delete expense");
      }

      await fetchExpenses();
      showMessage("success", "Expense deleted successfully");
      return true;
    } catch (deleteError) {
      showMessage("error", deleteError.message || "Failed to delete expense");
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchExpenses();
    } else {
      setExpenses([]);
      setMonthlySummary({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = {
    users,
    expenses,
    monthlySummary,
    currentPage,
    setCurrentPage,
    loading,
    error,
    success,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    settleUp,
    settlements,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

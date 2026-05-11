import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@clerk/clerk-react";
import { BASE_URL, USERS } from "./constants";

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const { getToken, signOut, isSignedIn, isLoaded, user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const isAdmin = currentUser?.role === "admin";

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

  const getHeaders = useCallback(async () => {
    const headers = {
      "Content-Type": "application/json",
    };
    try {
      const token = await getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (tokenError) {
      console.error("[Auth] Failed to get auth token:", tokenError);
    }
    return headers;
  }, [getToken]);

  const handleAuthError = useCallback(
    async (status, message) => {
      if (status === 401 || status === 403) {
        showMessage("error", "Session expired. Please sign in again.");
        await signOut();
        return true;
      }
      return false;
    },
    [signOut],
  );

  const fetchExpenses = useCallback(async () => {
    if (!isLoaded || !isSignedIn) {
      setExpenses([]);
      setMonthlySummary({});
      setCurrentUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getHeaders();
      let response;
      try {
        response = await fetch(`${BASE_URL}/expenses`, { headers });
      } catch (networkError) {
        console.error("[FetchExpenses] Network error:", networkError);
        throw new Error(
          "Cannot connect to server. Please check your internet connection or try again later.",
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("[FetchExpenses] Parse error:", parseError);
        throw new Error(
          `Server returned invalid response (status: ${response.status}). Please try again.`,
        );
      }

      if (!response.ok) {
        if (handleAuthError(response.status, data.message)) return;
        throw new Error(data.message || "Unable to load expenses");
      }

      setExpenses(normalizeExpenses(data.expenses || []));
      setSettlements(normalizeSettlements(data.settlements || []));
      setMonthlySummary(data.summary || {});

      // Store user info from backend response
      if (data.currentUser) {
        setCurrentUser(data.currentUser);
      }
    } catch (fetchError) {
      showMessage("error", fetchError.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, getHeaders, handleAuthError]);

  const settleUp = async (settlement) => {
    if (!isSignedIn) {
      showMessage("error", "Authentication required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}/expenses/settle`, {
        method: "POST",
        headers,
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
    if (!isSignedIn) {
      showMessage("error", "Authentication required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getHeaders();

      let response;
      try {
        response = await fetch(`${BASE_URL}/expenses`, {
          method: "POST",
          headers,
          body: JSON.stringify(expense),
        });
      } catch (networkError) {
        console.error(
          "[AddExpense] Network error - backend may not be running:",
          networkError,
        );
        throw new Error(
          "Cannot connect to server. Please ensure the backend is running on port 5000.",
        );
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error(
          `Server returned invalid response (status: ${response.status})`,
        );
      }

      if (!response.ok) {
        if (handleAuthError(response.status, data.message)) return false;
        throw new Error(data.message || "Unable to add expense");
      }

      await fetchExpenses();
      showMessage("success", "Expense added successfully!");
      return true;
    } catch (addError) {
      showMessage("error", addError.message || "Failed to add expense");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateExpense = async (id, updates) => {
    if (!isSignedIn) {
      showMessage("error", "Authentication required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}/expenses/${id}`, {
        method: "PUT",
        headers,
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
    if (!isSignedIn) {
      showMessage("error", "Authentication required.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = await getHeaders();
      const response = await fetch(`${BASE_URL}/expenses/${id}`, {
        method: "DELETE",
        headers,
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

  const hasFetchedRef = React.useRef(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        fetchExpenses();
      }
    } else {
      hasFetchedRef.current = false;
      setExpenses([]);
      setMonthlySummary({});
      setCurrentUser(null);
    }
  }, [isLoaded, isSignedIn, fetchExpenses]);

  const value = {
    users: USERS,
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
    currentUser,
    isAdmin,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

export default ExpenseContext;

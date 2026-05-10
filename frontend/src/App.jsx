import { ExpenseProvider } from "./ExpenseContext";
import useExpense from "./useExpense";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  useAuth,
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import ExpenseList from "./pages/ExpenseList";
import "./App.css";

function AppContent() {
  const { success, error, loading } = useExpense();
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <SignedIn>
        <Navbar />
      </SignedIn>
      <main
        className={
          isSignedIn
            ? "flex-1 pt-16"
            : "flex-1 py-10 flex flex-col items-center justify-center"
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {(success || error || loading) && isSignedIn && (
            <div className="space-y-3 mb-8">
              {success && (
                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 p-4 flex items-center gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">{success}</span>
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 p-4 flex items-center gap-3">
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
                  <span className="font-medium">{error}</span>
                </div>
              )}
              {loading && (
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300 p-4 flex items-center gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0 animate-spin"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4.555 5.168A1 1 0 003 6.56v.676a1 1 0 00.555.895l.308.146.662-.331a1 1 0 10-.894-1.788l-.63.315v-.497zm0 9.164a1 1 0 00-.555.895v.676a1 1 0 001 1h.676a1 1 0 00.894-.553l.146-.308-.331-.662a1 1 0 10-1.788.894l.315.63h-.497zm9.164 4.277a1 1 0 00.895.555h.676a1 1 0 001-1v-.676a1 1 0 00-.553-.895l-.308-.146-.662.331a1 1 0 101.788-.894l-.315-.63h.497zm0-9.164a1 1 0 01-.895-.555H12.56a1 1 0 00-.895 1.553l.308.146.662-.331a1 1 0 10-.894 1.788l.63-.315v.497zM5.91 7.025a1 1 0 00-1.414 0L4.277 8.243a1 1 0 001.414 1.414l1.219-1.219a1 1 0 000-1.414zm8.178 8.178a1 1 0 00-1.414-1.414l-1.219 1.219a1 1 0 001.414 1.414l1.219-1.219zm-1.414-9.592a1 1 0 000-1.414L12.043 4.277a1 1 0 10-1.414 1.414l1.219 1.219zm-8.178 8.178a1 1 0 000 1.414l1.219 1.219a1 1 0 101.414-1.414l-1.219-1.219z" />
                  </svg>
                  <span className="font-medium">Processing request...</span>
                </div>
              )}
            </div>
          )}

          <Routes>
            <Route
              path="/sign-in/*"
              element={
                <div className="flex justify-center">
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    forceRedirectUrl="/"
                  />
                </div>
              }
            />
            <Route
              path="/sign-up/*"
              element={
                <div className="flex justify-center">
                  <SignUp
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    forceRedirectUrl="/"
                  />
                </div>
              }
            />
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <Dashboard />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/add-expense"
              element={
                <>
                  <SignedIn>
                    <AddExpense />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/expenses"
              element={
                <>
                  <SignedIn>
                    <ExpenseList />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="*"
              element={<Navigate to={isSignedIn ? "/" : "/sign-in"} replace />}
            />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}

export default App;

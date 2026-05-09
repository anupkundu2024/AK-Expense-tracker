import { useContext } from "react";
import ExpenseContext from "./ExpenseContext";

const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpense must be used within ExpenseProvider");
  }
  return context;
};

export default useExpense;

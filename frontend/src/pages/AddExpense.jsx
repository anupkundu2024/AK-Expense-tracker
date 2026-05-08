import ExpenseForm from "../components/ExpenseForm";

const AddExpense = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="rounded-[32px] border border-white/20 bg-white/70 backdrop-blur-xl shadow-2xl shadow-black/5 p-8 sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Add Expense
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Record a new expense and choose who paid so the dashboard stays up
            to date.
          </p>
        </div>
        <ExpenseForm />
      </div>
    </div>
  );
};

export default AddExpense;

const SummaryCard = ({ title, value, subtitle, color = "purple" }) => {
  const bgVariants = {
    purple: "bg-purple-50",
    pink: "bg-pink-50",
    emerald: "bg-emerald-50",
    blue: "bg-blue-50",
  };

  const borderVariants = {
    purple: "border-purple-200",
    pink: "border-pink-200",
    emerald: "border-emerald-200",
    blue: "border-blue-200",
  };

  const titleVariants = {
    purple: "text-purple-600",
    pink: "text-pink-600",
    emerald: "text-emerald-600",
    blue: "text-blue-600",
  };

  return (
    <div
      className={`${bgVariants[color]} border ${borderVariants[color]} rounded-lg p-6 card-shadow`}
    >
      <h3
        className={`text-sm font-semibold ${titleVariants[color]} mb-2 uppercase tracking-wide`}
      >
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
    </div>
  );
};

export default SummaryCard;

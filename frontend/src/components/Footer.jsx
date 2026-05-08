const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer mt-8 w-full border-t border-white/10 bg-slate-900/70 backdrop-blur-xl text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-slate-100">
            Built by Anup Kundu
          </p>
          <p className="text-xs text-slate-400">Roommate Expense Tracker</p>
        </div>
        <p className="text-sm text-slate-400">© {year}</p>
      </div>
    </footer>
  );
};

export default Footer;

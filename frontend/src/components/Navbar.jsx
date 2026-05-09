import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import useExpense from "../useExpense";

const Navbar = () => {
  const { user } = useUser();
  const { isAdmin } = useExpense();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", to: "/" },
    { id: "add-expense", label: "Add Expense", to: "/add-expense" },
    { id: "expense-list", label: "Expenses", to: "/expenses" },
  ];

  const activeLinkClass =
    "bg-purple-100 text-purple-700 border border-purple-200 shadow-sm";
  const inactiveLinkClass =
    "text-gray-700 hover:text-gray-900 hover:bg-gray-100";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(255,255,255,0.92)] backdrop-blur-xl border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm">
                AK
              </div>
              <span className="text-lg font-semibold text-gray-900">
                AKExpenses
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive ? activeLinkClass : inactiveLinkClass
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-gray-900">
                {user?.fullName || user?.primaryEmailAddress?.emailAddress}
              </span>
              {isAdmin && (
                <span className="text-xs font-semibold text-purple-600">
                  Admin
                </span>
              )}
            </div>

            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10",
                },
              }}
            />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
            <div className="space-y-2 px-3 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `block rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive ? activeLinkClass : inactiveLinkClass
                    }`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

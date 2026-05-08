import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

const Signup = () => {
  const {
    register,
    loading,
    authError,
    setAuthError,
    successMessage,
    isAuthenticated,
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};

    if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!email.includes("@")) {
      errors.email = "Please enter a valid email";
    }

    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain an uppercase letter";
    }

    if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain a lowercase letter";
    }

    if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain a number";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    const success = await register(name, email, password, confirmPassword);
    if (success) {
      setTimeout(() => navigate("/"), 1500);
    }
  };

  const handleInput = (setter) => (event) => {
    setter(event.target.value);
    if (authError) setAuthError(null);
    setValidationErrors({});
  };

  const renderPasswordStrength = () => {
    const strength = [];
    if (password.length >= 8) strength.push(true);
    if (/[A-Z]/.test(password)) strength.push(true);
    if (/[a-z]/.test(password)) strength.push(true);
    if (/[0-9]/.test(password)) strength.push(true);

    let color = "bg-gray-200";
    let text = "";

    if (strength.length === 0) {
      text = "";
    } else if (strength.length < 2) {
      color = "bg-red-200";
      text = "Weak";
    } else if (strength.length < 4) {
      color = "bg-yellow-200";
      text = "Fair";
    } else {
      color = "bg-green-200";
      text = "Strong";
    }

    return { color, text, strength: strength.length };
  };

  const passwordStrength = renderPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl flex gap-8 lg:gap-12">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col justify-center w-1/2">
          <div className="mb-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-pink-500 text-2xl font-bold text-white shadow-lg">
                AK
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AKExpenses
              </h2>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Take Control of Your Money
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of users who are smarter about their spending.
              Create your account today and start tracking expenses
              effortlessly.
            </p>

            {/* Feature List */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 mt-1 flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Instant Setup</h3>
                  <p className="text-gray-600 text-sm">
                    Create account in less than a minute
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 mt-1 flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Bank-Level Security
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Your passwords are encrypted and never stored in plain text
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 mt-1 flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Privacy First</h3>
                  <p className="text-gray-600 text-sm">
                    We never sell your data or share it with third parties
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-xl p-8">
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-pink-500 text-xl font-bold text-white shadow-lg">
                  AK
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create your account
                </h1>
              </div>

              <div className="mb-8 text-center hidden lg:block">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create your account
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Join AKExpenses today and start managing your finances
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleInput(setName)}
                    className={`w-full rounded-lg border ${
                      validationErrors.name
                        ? "border-red-300"
                        : "border-gray-300"
                    } bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100`}
                    placeholder="John Doe"
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={handleInput(setEmail)}
                    className={`w-full rounded-lg border ${
                      validationErrors.email
                        ? "border-red-300"
                        : "border-gray-300"
                    } bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100`}
                    placeholder="you@example.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={handleInput(setPassword)}
                      className={`w-full rounded-lg border ${
                        validationErrors.password
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clipRule="evenodd"
                          />
                          <path d="M15.171 13.576l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414m2.121-2.121l1.414 1.414a1 1 0 01-1.414 1.414l-1.414-1.414" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">
                          Password strength:
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.strength === 0
                              ? "text-gray-500"
                              : passwordStrength.strength < 2
                                ? "text-red-600"
                                : passwordStrength.strength < 4
                                  ? "text-yellow-600"
                                  : "text-green-600"
                          }`}
                        >
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                              i < passwordStrength.strength
                                ? passwordStrength.color
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {validationErrors.password && (
                    <p className="mt-2 text-xs text-red-600">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={handleInput(setConfirmPassword)}
                      className={`w-full rounded-lg border ${
                        validationErrors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      } bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clipRule="evenodd"
                          />
                          <path d="M15.171 13.576l1.414 1.414a1 1 0 001.414-1.414l-1.414-1.414m2.121-2.121l1.414 1.414a1 1 0 01-1.414 1.414l-1.414-1.414" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Error Messages */}
                {authError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                    <p className="font-medium">Unable to create account</p>
                    <p className="mt-1">{authError}</p>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                    <p className="font-medium">{successMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:shadow-lg hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none mt-6"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-purple-600 hover:text-purple-700 transition"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Privacy Notice */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>
                  By creating an account, you agree to our Terms of Service and
                  Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

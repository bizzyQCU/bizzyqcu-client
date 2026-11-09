import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../hooks";
import { loginWithPassword } from "../../auth/api";
import { getErrorMessage } from "../../../lib/api-client";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginWithPassword({
        qcuIdNumber: identifier.trim(),
        password,
      });

      const { token, user } = res.data || {};

      if (!token || !user) {
        throw new Error("Invalid response from authentication service.");
      }

      if (user.role !== "ADMIN") {
        throw new Error("Access Denied: This account does not possess administrative credentials.");
      }

      // Successful admin login
      authLogin(user, token);
      navigate("/admin");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950">
      <div className="w-full max-w-md">
        {/* Brand Shield Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20 ring-1 ring-white/20 mb-3">
            🛡️
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-serif">BizzyQCU Administration</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-mono mt-1">
            Restricted Access Gateway • Authorized Officers Only
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1E293B]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -top-20 -right-20 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl"></div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                Admin QCU ID or Email
              </label>
              <input
                type="text"
                required
                placeholder="24-0001 or admin@bizzyqcu.edu.ph"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B1120] text-sm text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 leading-relaxed">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Verifying Credentials..." : "Access Admin Console"}
            </button>
          </form>

          {/* Quick Demo Helper */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <div className="text-[11px] text-slate-500 font-mono">
              Default Admin Account: <span className="text-amber-400">24-0001</span> • Password: <span className="text-amber-400">admin12345</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIdentifier("24-0001");
                setPassword("admin12345");
              }}
              className="mt-2 text-xs text-slate-400 hover:text-amber-300 underline font-medium"
            >
              Autofill Admin Credentials
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← Return to Campus Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}


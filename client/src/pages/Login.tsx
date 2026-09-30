import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, ArrowRight, UserCheck } from "lucide-react";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Vibhanu@123");
    setError("");
    setLoading(true);
    try {
      await login(demoEmail, "Vibhanu@123");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: "MARKETING", email: "marketing@vibhanu.com", desc: "Creates customer leads", color: "hover:border-blue-300 hover:bg-blue-50/50" },
    { role: "COMMUNICATION", email: "communication@vibhanu.com", desc: "Schedules meeting & address", color: "hover:border-amber-300 hover:bg-amber-50/50" },
    { role: "VIGILANCE", email: "vigilance@vibhanu.com", desc: "Uploads audio & verifies", color: "hover:border-emerald-300 hover:bg-emerald-50/50" },
    { role: "SUPPORT", email: "support@vibhanu.com", desc: "Checks address & allocates to Sales", color: "hover:border-purple-300 hover:bg-purple-50/50" },
    { role: "SALES", email: "sales@vibhanu.com", desc: "Full audio playback & claim", color: "hover:border-rose-300 hover:bg-rose-50/50" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side: Login Form */}
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200/80">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold shadow-md">
              V
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Vibh-Anu CRM</h2>
              <p className="text-xs text-slate-500 font-medium">Role-Based Lead Management</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-800">Sign in to your account</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Choose a quick demo account on the right or enter credentials.
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Corporate Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. vigilance@vibhanu.com"
                  required
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Right Side: 1-Click Role Switcher for Demo */}
        <div className="space-y-3">
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-800">
              <UserCheck size={13} />
              Interview Fast-Pass
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-2">1-Click Department Switcher</h4>
            <p className="text-xs text-slate-500">
              Click any role card below to instantly sign in with pre-seeded demo credentials.
            </p>
          </div>

          <div className="space-y-2.5">
            {demoAccounts.map((demo) => (
              <button
                key={demo.role}
                type="button"
                onClick={() => handleQuickDemoLogin(demo.email)}
                disabled={loading}
                className={`w-full text-left p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs transition cursor-pointer flex items-center justify-between ${demo.color}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{demo.role}</span>
                    <span className="text-[11px] font-mono text-slate-400">({demo.email})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{demo.desc}</p>
                </div>
                <ArrowRight size={15} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

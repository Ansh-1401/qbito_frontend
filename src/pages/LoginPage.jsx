import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check URL if they clicked "Sign up" from another page
  const urlParams = new URLSearchParams(window.location.search);
  const [isLogin, setIsLogin] = useState(urlParams.get("signup") !== "true");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setError("");

    try {
      let data;
      if (isLogin) {
        data = await login(username.trim(), password);
      } else {
        data = await register(username.trim(), password);
      }

      // Role-based redirect
      if (data.role === "SUPER_ADMIN") {
        navigate("/super-admin", { replace: true });
      } else if (data.role === "RESTAURANT_ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || (isLogin ? "Login failed. Please try again." : "Registration failed. Try a different username."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-hidden relative flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-40 overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-16 h-72 w-72 rounded-full bg-orange-500 blur-3xl"
          animate={{ x: [0, 35, 0], y: [0, 25, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-24 -right-20 h-72 w-72 rounded-full bg-purple-500 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-black font-extrabold text-2xl mx-auto shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              S
            </div>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
              QBito
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isLogin ? "Sign in to your dashboard" : "Create a new customer account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition text-sm"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-black font-extrabold py-3.5 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:opacity-95 transition disabled:opacity-60"
            >
              {loading ? "Processing..." : isLogin ? "Sign In →" : "Sign Up →"}
            </motion.button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {isLogin && (
              <div className="border-t border-white/10 pt-4 mt-4">
                <p className="text-[11px] text-gray-500 text-center">
                  Demo credentials
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("admin");
                      setPassword("admin123");
                    }}
                    className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition"
                  >
                    👑 Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername("restoadmin");
                      setPassword("resto123");
                    }}
                    className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition"
                  >
                    🏪 Restaurant Admin
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">
          QBito © 2026 — QR-Based Ordering
        </p>
      </motion.div>
    </div>
  );
}

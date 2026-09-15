import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/authApi";
import { ShieldCheck, Lock, User, AlertCircle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("gateway-admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await authApi.login(username, password);

      login(res.data);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="bg-slate-950 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/10 text-blue-500 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-white">
            Spring Cloud API Gateway
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Management & Operation Control Plane
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>

            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter password"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            Protected by Keycloak. Only users with the
            <code className="text-blue-600 font-mono ml-1">GATEWAY_ADMIN</code>
            role can access the gateway console.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded font-medium text-xs shadow transition-colors"
          >
            {loading ? "Authenticating..." : "Sign In to Console"}
          </button>
        </form>
      </div>
    </div>
  );
}

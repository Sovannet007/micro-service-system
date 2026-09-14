import React, { useEffect, useState } from "react";
import { sessionApi } from "../api/sessionApi";
import { useToast } from "../context/ToastContext";
import { KeyRound, ShieldAlert, RefreshCw, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const { user } = useAuth();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await sessionApi.getSessions();
      setSessions(res.data);
    } catch (err) {
      addToast(err.message || "Failed to fetch active sessions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevoke = async (sessionId) => {
    if (!window.confirm("Revoke this session token immediately?")) return;
    try {
      await sessionApi.revokeSession(sessionId);
      addToast("Session revoked", "success");
      loadSessions();
    } catch (err) {
      addToast(err.message || "Revoke failed", "error");
    }
  };

  const handleLogoutAll = async () => {
    if (
      !window.confirm(
        "⚠️ CRITICAL SECURITY ACTION: Revoke ALL active user sessions across all devices?",
      )
    )
      return;
    try {
      await sessionApi.logoutAll(user?.username || "admin");
      addToast("All sessions successfully revoked", "success");
      loadSessions();
    } catch (err) {
      addToast(err.message || "Action failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Session Security Management
          </h1>
          <p className="text-xs text-slate-500">
            Active administrator authorization sessions and tokens
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadSessions}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handleLogoutAll}
            className="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Logout All Sessions
          </button>
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading session tokens...
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <th className="p-3">User</th>
                <th className="p-3">Session ID</th>
                <th className="p-3">Device / Browser</th>
                <th className="p-3">Platform</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Last Activity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <tr key={s.sessionId} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-800">{s.username}</td>
                  <td className="p-3 font-mono text-slate-500">
                    {s.sessionId}
                  </td>
                  <td className="p-3 text-slate-700">{s.device}</td>
                  <td className="p-3 text-slate-600">{s.platform}</td>
                  <td className="p-3 font-mono text-slate-700">
                    {s.ipAddress}
                  </td>
                  <td className="p-3 text-slate-500">{s.lastActivity}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleRevoke(s.sessionId)}
                      className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[11px] font-medium hover:bg-red-100"
                    >
                      Revoke Session
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
